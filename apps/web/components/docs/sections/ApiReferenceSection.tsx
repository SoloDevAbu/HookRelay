"use client";

import React from "react";
import { Code } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";

export function ApiReferenceSection() {
  return (
    <section id="api-reference" className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Code className="size-6 text-blue-600" />
        API Reference
      </h2>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
        All client endpoints require client authorization header key:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
          X-Api-Key
        </code>
        . Admin tasks require:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
          X-Admin-Key
        </code>
        .
      </p>

      <div className="flex flex-col gap-6">
        {/* Endpoint Card: POST /tenants */}
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-600">
                  POST
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  /tenants
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Admin Access Only
              </span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Registers a new client tenant workspace. Returns the raw API
              credential key.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  CURL COMMAND
                </span>
                <div className="relative rounded border bg-muted/30 p-3 font-mono text-[9px] text-foreground/80">
                  <pre className="whitespace-pre-wrap select-all">{`curl -X POST http://localhost:3000/tenants \\
  -H "X-Admin-Key: <secret>" \\
  -d '{"name": "production-app"}'`}</pre>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  JSON RESPONSE (201)
                </span>
                <div className="rounded border bg-muted/30 p-3 font-mono text-[9px] text-foreground/80">
                  <pre>{`{
  "success": true,
  "data": {
    "tenant": { "id": "uuid", "name": "production-app" },
    "apiKey": "hr_prod_key_..."
  }
}`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoint Card: POST /events */}
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-600">
                  POST
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  /events
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                X-Api-Key Required
              </span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Ingests a new webhook payload. Loops to buffer queue and returns
              202 accepted.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  CURL COMMAND
                </span>
                <div className="rounded border bg-muted/30 p-3 font-mono text-[9px] text-foreground/80">
                  <pre className="whitespace-pre-wrap select-all">{`curl -X POST http://localhost:3000/events \\
  -H "X-Api-Key: hr_key_..." \\
  -d '{
    "eventType": "order.placed",
    "payload": {"id": 12},
    "idempotencyKey": "order-12"
  }'`}</pre>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  JSON RESPONSE (202)
                </span>
                <div className="rounded border bg-muted/30 p-3 font-mono text-[9px] text-foreground/80">
                  <pre>{`{
  "success": true,
  "data": {
    "eventId": "uuid-event",
    "duplicate": false,
    "status": "accepted"
  }
}`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
