"use client";

import React from "react";
import { Gauge } from "@phosphor-icons/react";

export function RateLimitingSection() {
  return (
    <section id="rate-limiting" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Gauge className="size-6 text-blue-600" />
        Rate Limiting
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Rate limiting is active per-tenant using Redis counters. If a workspace
        exceeds its rate limits (e.g. 1,000 req/min), HookRelay returns a 429
        response block containing a standard{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
          Retry-After
        </code>{" "}
        header specifying when ingestion re-opens.
      </p>
    </section>
  );
}
