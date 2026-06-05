"use client";

import React from "react";
import { GitMerge } from "@phosphor-icons/react";

export function PipelineSection() {
  return (
    <section id="pipeline" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <GitMerge className="size-6 text-indigo-600" />
        Delivery Pipeline
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Webhooks pass through a fast and reliable pipeline to isolate failures
        and guarantee payload delivery.
      </p>
      <div className="mb-6 overflow-x-auto rounded-lg border bg-muted/40 p-4 text-center font-mono text-xs font-bold text-blue-600">
        Producer &rarr; API (auth + rate limit + idempotency) &rarr; Redis Buffer &rarr; Ingest Worker (batch SQL + fanout jobs) &rarr; Fanout Worker (endpoints + delivery rows + Pub/Sub) &rarr; Per-Tenant Delivery Queue &rarr; Delivery Worker (circuit breaker + HMAC + HTTP) &rarr; Consumer Endpoint
      </div>
      <ul className="flex list-disc flex-col gap-3 pl-5 text-sm text-muted-foreground">
        <li>
          <strong>Redis Buffering</strong>: The API responds in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">202 Accepted</code> after a single <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">LPUSH</code> — no SQL on the hot path. Your producers never wait on DB latency.
        </li>
        <li>
          <strong>Atomic Lua Batch Pop</strong>: The Ingest Worker uses a custom Lua script (<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">LRANGE + LTRIM</code>) to atomically pop up to 100 events in a single Redis round-trip, then performs a single bulk <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">INSERT</code> and <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">addBulk</code> to BullMQ.
        </li>
        <li>
          <strong>Fanout &amp; Pub/Sub</strong>: The Fanout Worker resolves matching endpoints from Postgres and enqueues delivery jobs into a per-tenant BullMQ queue. It then publishes a Redis Pub/Sub message so the Delivery Worker Manager can spin up a new worker process for new tenants on-the-fly.
        </li>
        <li>
          <strong>Tenant Isolation</strong>: Every tenant gets its own BullMQ delivery queue and dedicated worker (concurrency=50). One slow or unreachable destination never delays deliveries for other tenants.
        </li>
        <li>
          <strong>Caching in Delivery</strong>: Delivery Workers cache endpoint config (5 min TTL) and event payloads (1 hr TTL) in Redis to eliminate N+1 Postgres queries when the same event fans out to many endpoints.
        </li>
      </ul>
    </section>
  );
}
