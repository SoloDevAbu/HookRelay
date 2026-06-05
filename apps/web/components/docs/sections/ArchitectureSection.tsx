"use client";

import React from "react";
import { Cpu } from "@phosphor-icons/react";
import { Mermaid } from "@/components/ui/mermaid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const architectureDiagram = `
flowchart TD
    A[Producers] -->|"POST /events\\nX-Api-Key"| API

    subgraph API["API Service - Fastify"]
        B[Tenant Auth\\nRedis cache 60s TTL] --> C[Rate Limiter\\nLua fixed-window counter]
        C --> D[Idempotency Check\\nRedis GET]
        D -->|"LPUSH"| E[(Redis Buffer\\nhookrelay:ingest_buffer)]
        D -->|"202 Accepted"| RES[Return to Producer]
    end

    E -->|"Lua BATCH_POP\\nup to 100 at once"| IW

    subgraph WorkerProcess["Worker Process"]
        IW[Ingest Worker\\npoll loop + BRPOP] -->|"Batch INSERT"| PG[(PostgreSQL)]
        IW -->|"fanoutQueue.addBulk"| FQ[(Fanout Queue\\nBullMQ/Redis)]
        IW -->|"Set idempotency keys"| RC[(Redis)]

        FQ --> FW[Fanout Worker\\nconcurrency=10]
        FW -->|"findEndpoints\\nby tenant + eventType"| PG
        FW -->|"batchInsertDeliveries"| PG
        FW -->|"deliveryQueue.addBulk"| DQ["Per-Tenant Delivery Queues\\nBullMQ/Redis\\none queue per tenant"]
        FW -->|"Pub/Sub publish"| PS[(Redis Pub/Sub\\nWORKER_CHANNEL)]

        PS --> DWM[Delivery Worker Manager\\nbootstrap + subscribe]
        DWM -->|"spin up new worker"| DW

        DQ --> DW[Delivery Workers\\nconcurrency=50 per tenant]
        DW -->|"shouldAllowRequest"| CB{Circuit Breaker\\nRedis state}
        CB -->|"open: requeue +30s delay"| DQ
        CB -->|"closed / half-open"| SIGN[Sign Payload\\nHMAC-SHA256]
        SIGN --> HTTP[HTTP POST\\nundici with timeout]
        HTTP -->|"2xx"| SUC[Record Success\\nReset Circuit Breaker]
        HTTP -->|"non-2xx or timeout"| FAIL[Record Failure\\nUpdate Circuit Breaker]
        FAIL --> DEC{Max Attempts\\nReached?}
        DEC -->|"no: schedule retry\\nexponential backoff"| DQ
        DEC -->|"yes: mark dead"| DEAD[Dead Delivery\\nstatus=dead]

        SUC -->|"insertDeliveryAttempt"| PG
        FAIL -->|"insertDeliveryAttempt"| PG
    end

    HTTP -->|"2xx delivered"| CONS[Consumer Endpoints]
`;

export function ArchitectureSection() {
  return (
    <section id="architecture" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Cpu className="size-6 text-blue-600" />
        Architecture
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        HookRelay accepts events from producers via a REST API, buffers them in
        Redis, and guarantees delivery to endpoints through BullMQ workers. The
        architecture supports horizontal scaling and automatic recovery.
      </p>

      {/* Mermaid Architecture Chart */}
      <div className="mb-6 flex justify-center overflow-x-auto rounded-xl border border-border bg-muted/30 p-5 shadow-sm">
        <Mermaid chart={architectureDiagram} className="w-full max-w-2xl" />
      </div>

      <h3 className="mb-3 font-mono text-sm font-bold text-foreground">
        Data Flow
      </h3>
      <ol className="mb-6 flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
        <li>
          Producers submit events via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            POST /events
          </code>{" "}
          with an{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            X-Api-Key
          </code>{" "}
          header.
        </li>
        <li>
          The API authenticates (Redis-cached tenant lookup, 60s TTL), applies
          the Lua fixed-window rate limiter, checks idempotency via Redis GET,
          then pushes the event to the Redis buffer (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            LPUSH
          </code>
          ) and immediately returns 202.
        </li>
        <li>
          The <strong>Ingest Worker</strong> runs a poll loop with{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            BRPOP
          </code>{" "}
          (blocking pop). When data arrives it uses an atomic Lua script (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            LRANGE + LTRIM
          </code>
          ) to pop up to 100 events in a single round-trip, batch-inserts them
          into PostgreSQL, bulk-enqueues fanout jobs via BullMQ, and sets Redis
          idempotency keys for successful inserts.
        </li>
        <li>
          The <strong>Fanout Worker</strong> (concurrency=10) reads fanout jobs
          from BullMQ, queries PostgreSQL for matching active endpoints
          (respecting{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            eventTypeFilter
          </code>
          ), batch-inserts delivery rows, bulk-enqueues delivery jobs into the
          per-tenant delivery queue, and publishes a notification to Redis
          Pub/Sub so the Delivery Worker Manager can spin up a new worker for
          new tenants.
        </li>
        <li>
          <strong>Delivery Workers</strong> (concurrency=50 per tenant) process
          jobs from per-tenant BullMQ queues. They fetch endpoint config and
          event payloads from Redis cache (falling back to Postgres), check the
          circuit breaker state, sign the payload with HMAC-SHA256, and POST to
          the endpoint URL via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            undici
          </code>
          .
        </li>
        <li>
          On success: delivery attempt is recorded and circuit breaker is reset.
          On failure: attempt is recorded, circuit breaker failure count is
          incremented, and a retry is scheduled with exponential backoff (10s →
          30s → 1m → 5m → ... → 24h). After max attempts the delivery is marked{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            dead
          </code>
          .
        </li>
      </ol>

      <h3 className="mb-3 font-mono text-sm font-bold text-foreground">
        Database Schema
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>TABLE</TableHead>
            <TableHead>PURPOSE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs text-muted-foreground">
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              tenants
            </TableCell>
            <TableCell>
              Multi-tenant account credentials, API hashes, and rate limit
              definitions.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              endpoints
            </TableCell>
            <TableCell>
              Registered webhook target URLs with signing secrets, filters, and
              status flags.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              events
            </TableCell>
            <TableCell>
              Payload backups, event types, and idempotency key references.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              deliveries
            </TableCell>
            <TableCell>
              Delivery records mapping events to endpoints and scheduling retry
              timings.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              delivery_attempts
            </TableCell>
            <TableCell>
              Audit log tracking HTTP response statuses, raw error messages, and
              latency profiles.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  );
}
