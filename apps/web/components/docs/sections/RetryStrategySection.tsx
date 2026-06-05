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
        Failed delivery calls (such as network timeout, 404, or 500 status
        codes) automatically retry using a fixed exponential backoff table.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ATTEMPT</TableHead>
            <TableHead>BACKOFF DELAY</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-mono text-xs text-muted-foreground">
          <TableRow>
            <TableCell>Attempt 1</TableCell>
            <TableCell>10 Seconds</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Attempt 2</TableCell>
            <TableCell>30 Seconds</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Attempt 3</TableCell>
            <TableCell>1 Minute</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Attempt 4</TableCell>
            <TableCell>5 Minutes</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Attempt 5</TableCell>
            <TableCell>30 Minutes</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Attempt 9</TableCell>
            <TableCell>12 Hours</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Attempt 10 (Final)</TableCell>
            <TableCell>24 Hours</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  );
}
