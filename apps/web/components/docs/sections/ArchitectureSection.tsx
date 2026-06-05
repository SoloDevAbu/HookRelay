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
    classDef default fill:transparent,stroke:currentColor,stroke-width:1px,color:currentColor;
    classDef highlight fill:#2563eb,stroke:none,color:white;
    classDef db fill:transparent,stroke:#10b981,stroke-width:2px,color:currentColor;

    A[Producers] -->|POST /events| B

    subgraph API["API (Fastify)"]
        B[Gateway] --> C[Tenant Auth]
        C --> D[Rate Limiter]
        D --> E[Idempotency]
    end

    C -.->|Cache| R[(Redis)]
    D -.->|Lua INCR| R
    E -.->|GET| R
    
    E -->|LPUSH| F[(Redis Buffer)]

    F -->|RPOP batches of 100| G

    subgraph Worker["Worker Process"]
        G[Ingest Worker] -->|Batch INSERT| PG[(PostgreSQL)]
        G -->|Bulk enqueue| H[Fanout Worker]
        
        H -->|Resolve endpoints| PG
        H -->|Create delivery rows| PG
        
        H -->|Schedule jobs| I[Delivery Workers per tenant]
        
        I --> J[Circuit breaker]
        J --> K[HMAC-SHA256 signing]
        K --> L[HTTP delivery]
        
        L -.->|Errors| M[DLQ Worker]
    end

    L -->|Deliver| N[Consumer Endpoints]
    
    class A,N highlight
    class R,PG db
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
          Producers submit events to the gateway via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            POST /events
          </code>
          .
        </li>
        <li>
          The API authenticates, rate-limits, checks idempotency, and stores the
          event in a Redis queue, responding immediately.
        </li>
        <li>
          The <strong>Ingest Worker</strong> processes queue batches, performing
          bulk SQL inserts to PostgreSQL and BullMQ.
        </li>
        <li>
          The <strong>Fanout Worker</strong> resolves endpoint filters and
          schedules delivery jobs.
        </li>
        <li>
          <strong>Delivery Workers</strong> sign requests using HMAC-SHA256 and
          execute delivery calls, respecting circuit breakers.
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
