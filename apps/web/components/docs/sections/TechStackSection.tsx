"use client";

import React from "react";
import { Stack } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TechStackSection() {
  return (
    <section id="tech-stack" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Stack className="size-6 text-blue-600" />
        Tech Stack
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>COMPONENT</TableHead>
            <TableHead>TECHNOLOGY</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs text-muted-foreground">
          <TableRow>
            <TableCell className="font-semibold text-foreground">
              Language runtime
            </TableCell>
            <TableCell>TypeScript (Node.js &gt;= 18)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-foreground">
              API gateway framework
            </TableCell>
            <TableCell>Fastify 5 (High-speed schema validations)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-foreground">
              Background queues
            </TableCell>
            <TableCell>BullMQ (Bull Redis queues)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-foreground">
              Relational database
            </TableCell>
            <TableCell>PostgreSQL 16</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-foreground">
              Database ORM mapping
            </TableCell>
            <TableCell>Drizzle ORM</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-foreground">
              Caching & rate metrics
            </TableCell>
            <TableCell>Redis 7 (Lua atomic scripts)</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  );
}
