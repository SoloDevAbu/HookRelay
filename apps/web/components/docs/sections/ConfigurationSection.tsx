"use client";

import React from "react";
import { Sliders } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ConfigurationSection() {
  return (
    <section id="configuration" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Sliders className="size-6 text-indigo-600" />
        Configuration Settings
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Settings are validated at startup using Zod schemas. Configure these
        using `.env` file variables.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>VARIABLE</TableHead>
            <TableHead>DESCRIPTION</TableHead>
            <TableHead>DEFAULT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs text-muted-foreground">
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">DATABASE_URL</TableCell>
            <TableCell>PostgreSQL connection string.</TableCell>
            <TableCell className="text-red-400 italic">Required</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">REDIS_URL</TableCell>
            <TableCell>Redis connection string.</TableCell>
            <TableCell className="text-red-400 italic">Required</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">ADMIN_SECRET</TableCell>
            <TableCell>Secret for admin API endpoints (min 32 chars).</TableCell>
            <TableCell className="text-red-400 italic">Required</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">PORT</TableCell>
            <TableCell>API server port.</TableCell>
            <TableCell className="font-mono">8080</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">NODE_ENV</TableCell>
            <TableCell><code className="rounded bg-muted px-1 py-0.5">development</code>, <code className="rounded bg-muted px-1 py-0.5">production</code>, or <code className="rounded bg-muted px-1 py-0.5">test</code>.</TableCell>
            <TableCell className="font-mono">development</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">MAX_DELIVERY_ATTEMPTS</TableCell>
            <TableCell>Max delivery attempts before a delivery is moved to dead status.</TableCell>
            <TableCell className="font-mono">10</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">DELIVERY_TIMEOUT_MS</TableCell>
            <TableCell>HTTP request timeout per delivery attempt.</TableCell>
            <TableCell className="font-mono">30000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">CIRCUIT_BREAKER_THRESHOLD</TableCell>
            <TableCell>Consecutive failures before circuit opens.</TableCell>
            <TableCell className="font-mono">5</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">CIRCUIT_BREAKER_COOLDOWN_MS</TableCell>
            <TableCell>Time before circuit transitions to HALF-OPEN for a probe request.</TableCell>
            <TableCell className="font-mono">60000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">RATE_LIMIT_WINDOW_MS</TableCell>
            <TableCell>Fixed-window duration for per-tenant rate limiting.</TableCell>
            <TableCell className="font-mono">60000</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  );
}
