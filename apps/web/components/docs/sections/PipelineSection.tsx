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
      <div className="mb-6 overflow-hidden rounded-lg border bg-muted/40 p-4 text-center font-mono text-xs font-bold text-ellipsis whitespace-nowrap text-blue-600">
        Event Ingested &rarr; Redis Buffer &rarr; Batch SQL &rarr; Fanout worker
        &rarr; Per-Tenant Worker Queue &rarr; Client Endpoint
      </div>
      <ul className="flex list-disc flex-col gap-3 pl-5 text-sm text-muted-foreground">
        <li>
          <strong>Redis Buffering</strong>: Ingested events sit in memory. Your
          servers don't lock database connections.
        </li>
        <li>
          <strong>Batch Worker Ingestion</strong>: Event logs are batch flushed
          to Postgres in blocks of 100 to reduce database connection
          bottlenecks.
        </li>
        <li>
          <strong>Tenant Isolation</strong>: BullMQ handles delivery tasks.
          Every tenant has a separate concurrent worker queue, preventing one
          slow customer destination from throttling the rest of the network.
        </li>
      </ul>
    </section>
  );
}
