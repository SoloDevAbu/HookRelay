"use client";

import React from "react";
import { Lightning } from "@phosphor-icons/react";

export function CircuitBreakerSection() {
  return (
    <section id="circuit-breaker" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Lightning className="size-6 text-indigo-600" />
        Circuit Breaker
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Each destination endpoint operates under an isolated Redis-backed
        circuit breaker state machine:
      </p>
      <ul className="flex list-disc flex-col gap-3 pl-5 text-sm text-muted-foreground">
        <li>
          <strong>CLOSED</strong>: Normal operation. Delivery jobs execute immediately.
        </li>
        <li>
          <strong>OPEN</strong>: Triggered after <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">CIRCUIT_BREAKER_THRESHOLD</code> (default 5) consecutive failures. Incoming delivery jobs for this endpoint are requeued into the per-tenant BullMQ queue with a <strong>30-second delay</strong> (no attempt is counted), preventing wasted HTTP calls against a clearly-down endpoint.
        </li>
        <li>
          <strong>HALF-OPEN</strong>: After <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">CIRCUIT_BREAKER_COOLDOWN_MS</code> (default 60s), the state transitions to HALF-OPEN. One probe delivery is allowed through. If it returns 2xx the circuit closes and the failure counter resets. If it fails the circuit re-opens.
        </li>
      </ul>
    </section>
  );
}
