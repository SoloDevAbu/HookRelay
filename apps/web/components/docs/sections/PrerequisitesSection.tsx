"use client";

import React from "react";
import { CheckSquare } from "@phosphor-icons/react";

export function PrerequisitesSection() {
  return (
    <section id="prerequisites" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <CheckSquare className="size-6 text-indigo-600" />
        Prerequisites
      </h2>
      <ul className="flex list-disc flex-col gap-2.5 pl-5 text-sm text-muted-foreground">
        <li>
          <strong>Node.js</strong>: version 18 or higher.
        </li>
        <li>
          <strong>pnpm</strong>: version 9.0 or higher.
        </li>
        <li>
          <strong>Docker / Docker Compose</strong>: for running database
          containers.
        </li>
        <li>
          <strong>PostgreSQL 16</strong> and <strong>Redis 7</strong>.
        </li>
      </ul>
    </section>
  );
}
