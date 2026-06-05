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
            <TableCell className="font-mono font-bold text-foreground">
              DATABASE_URL
            </TableCell>
            <TableCell>PostgreSQL credentials string.</TableCell>
            <TableCell className="text-red-400 italic">Required</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              REDIS_URL
            </TableCell>
            <TableCell>Redis host and port url.</TableCell>
            <TableCell className="text-red-400 italic">Required</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              ADMIN_SECRET
            </TableCell>
            <TableCell>Access token for managing retries and DLQ.</TableCell>
            <TableCell className="text-red-400 italic">Required</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              MAX_DELIVERY_ATTEMPTS
            </TableCell>
            <TableCell>
              Total HTTP delivery retries before moving to DLQ.
            </TableCell>
            <TableCell className="font-mono">10</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono font-bold text-foreground">
              CIRCUIT_BREAKER_THRESHOLD
            </TableCell>
            <TableCell>
              Consecutive client failures before opening circuit.
            </TableCell>
            <TableCell className="font-mono">5</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  );
}
