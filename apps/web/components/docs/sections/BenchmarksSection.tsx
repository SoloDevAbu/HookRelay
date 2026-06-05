"use client";

import React from "react";
import { Graph } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function BenchmarksSection() {
  return (
    <section id="benchmarks" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Graph className="size-6 text-indigo-600" />
        Performance Benchmarks
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        HookRelay is benchmarked using k6 on a local Docker framework. Ingestion
        throughput processes over **1,259 requests per second** concurrently.
      </p>

      <h3 className="mb-3 font-mono text-sm font-bold text-foreground">
        Throughput Profile
      </h3>
      <Table className="mb-6">
        <TableHeader>
          <TableRow>
            <TableHead>METRIC</TableHead>
            <TableHead>VALUE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-mono text-xs text-muted-foreground">
          <TableRow>
            <TableCell className="font-sans">Throughput</TableCell>
            <TableCell className="font-bold text-foreground">
              1,259 req/s
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-sans">p50 Latency</TableCell>
            <TableCell className="font-bold text-foreground">73 ms</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-sans">p95 Latency</TableCell>
            <TableCell className="font-bold text-foreground">166 ms</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-sans">Error Rate (&gt;500ms)</TableCell>
            <TableCell className="font-bold text-foreground">0.12%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-sans">HTTP failure rate</TableCell>
            <TableCell className="font-bold text-foreground">0.00%</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <h3 className="mb-3 font-mono text-sm font-bold text-foreground">
        Optimization History
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CHANGE STAGE</TableHead>
            <TableHead>p50</TableHead>
            <TableHead>p95</TableHead>
            <TableHead>THROUGHPUT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-mono text-xs text-muted-foreground">
          <TableRow>
            <TableCell className="font-sans font-semibold">
              Baseline Node API
            </TableCell>
            <TableCell>247 ms</TableCell>
            <TableCell>709 ms</TableCell>
            <TableCell>342 req/s</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-sans font-semibold">
              Fastify Schemas & Pino Logging
            </TableCell>
            <TableCell>190 ms</TableCell>
            <TableCell>444 ms</TableCell>
            <TableCell>455 req/s</TableCell>
          </TableRow>
          <TableRow className="bg-emerald-500/5 font-semibold text-emerald-500">
            <TableCell className="font-sans font-bold">
              Redis Buffer + Batch SQL Inserts
            </TableCell>
            <TableCell>73 ms</TableCell>
            <TableCell>166 ms</TableCell>
            <TableCell>1,259 req/s</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  );
}
