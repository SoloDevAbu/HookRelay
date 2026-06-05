"use client";

import React from "react";
import { Folder } from "@phosphor-icons/react";

export function StructureSection() {
  return (
    <section id="structure" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Folder className="size-6 text-blue-600" />
        Project Structure
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        HookRelay is organized as a pnpm workspace monorepo divided into
        applications (`apps`) and packages (`packages`).
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-muted/30 p-5 font-mono text-[10px] leading-relaxed text-foreground/80 shadow-sm">
        <pre>{`hookrelay/
├── apps/
│   ├── api/                    # Fastify HTTP server ingestion gateway
│   │   └── src/
│   │       ├── main.ts         # Server entry point
│   │       ├── routes/         # REST API routes (events, tenants, endpoints)
│   │       └── middleware/     # Rate limiter & auth filters
│   ├── worker/                 # Background job worker orchestrators
│   │   └── src/
│   │       └── workers/        # BullMQ worker processors (ingest, fanout, delivery, dlq)
│   ├── mock-server/            # Webhook consumer mock server
│   └── web/                    # Next.js dashboard for tenants and endpoints
|
├── packages/
|   ├──config/                    # Environment configuration
│   ├── db/                     # Drizzle ORM schema, push migrations, queries
│   ├── lib/                    # Redis client, logger (pino), HTTP client (undici)
│   ├── queue/                  # BullMQ definitions, Redis connection clients
│   ├── services/               # Ingest, fanout, circuit-breakers, signature validators
│   └── typescript-config/      # Workspace shared typescript settings
├── k6/                         # Load test scripts
├── docker/
│   ├── Dockerfile.api
│   └── Dockerfile.worker
└── docker-compose.yml          # Container configuration`}</pre>
      </div>
    </section>
  );
}
