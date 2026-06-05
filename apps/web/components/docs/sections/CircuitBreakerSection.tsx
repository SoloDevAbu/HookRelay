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
          <strong>CLOSED</strong>: Normal status. Deliveries run freely.
        </li>
        <li>
          <strong>OPEN</strong>: Triggered after 5 consecutive endpoint errors.
          Deliveries bypass the destination and auto-schedule for delayed retry,
          avoiding server exhaustion.
        </li>
        <li>
          <strong>HALF-OPEN</strong>: After a 60-second cooldown, one probe
          request executes. If it returns 2xx, the circuit closes. If it fails,
          the circuit re-opens.
        </li>
      </ul>
    </section>
  );
}
