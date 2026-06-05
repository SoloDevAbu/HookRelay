"use client";

import React from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RetryStrategySection() {
  return (
    <section id="retry-strategy" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <ArrowClockwise className="size-6 text-blue-600" />
        Retry Strategy
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Failed delivery calls (non-2xx response, timeout, or network error) automatically retry using a <strong>fixed backoff schedule</strong> defined in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">retry.service.ts</code>. After{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">MAX_DELIVERY_ATTEMPTS</code> (default 10) the delivery is marked{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">dead</code>.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ATTEMPT</TableHead>
            <TableHead>BACKOFF DELAY</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-mono text-xs text-muted-foreground">
          <TableRow><TableCell>Attempt 1</TableCell><TableCell>10 seconds</TableCell></TableRow>
          <TableRow><TableCell>Attempt 2</TableCell><TableCell>30 seconds</TableCell></TableRow>
          <TableRow><TableCell>Attempt 3</TableCell><TableCell>1 minute</TableCell></TableRow>
          <TableRow><TableCell>Attempt 4</TableCell><TableCell>5 minutes</TableCell></TableRow>
          <TableRow><TableCell>Attempt 5</TableCell><TableCell>30 minutes</TableCell></TableRow>
          <TableRow><TableCell>Attempt 6</TableCell><TableCell>1 hour</TableCell></TableRow>
          <TableRow><TableCell>Attempt 7</TableCell><TableCell>3 hours</TableCell></TableRow>
          <TableRow><TableCell>Attempt 8</TableCell><TableCell>6 hours</TableCell></TableRow>
          <TableRow><TableCell>Attempt 9</TableCell><TableCell>12 hours</TableCell></TableRow>
          <TableRow className="font-semibold text-foreground"><TableCell>Attempt 10 (Final)</TableCell><TableCell>24 hours → marked dead</TableCell></TableRow>
        </TableBody>
      </Table>
    </section>
  );
}
