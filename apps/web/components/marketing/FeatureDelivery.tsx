"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PaperPlane,
  Terminal,
  Copy,
  Check,
  CheckCircle,
  Database,
  Globe,
  Gear,
  Circle,
} from "@phosphor-icons/react";

export function FeatureDelivery() {
  const [copied, setCopied] = useState(false);
  const [activeEvent, setActiveEvent] = useState<"created" | "updated">(
    "created"
  );
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const curlCommand = `curl -X POST "https://api.hookrelay.com/endpoints" \\
  -H "Authorization: Bearer hr_key_prod_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://api.client.com/webhooks",
    "eventTypeFilter": ["order.${activeEvent}"]
  }'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mx-auto w-full max-w-7xl border-t border-border/50 bg-muted/10 px-4 py-20">
      {/* Event Gateway Hero Row */}
      <div className="mb-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Diagram Column (Left) */}
        <div className="relative order-2 flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 p-8 lg:order-1 lg:col-span-7">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:10px_10px]" />

          {/* SVG Animated Lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Input to Hub */}
            <path
              d="M 80 170 H 350"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 80 170 H 350"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="6 20"
              className="animate-dash"
            />

            {/* Hub to Webhooks */}
            <path
              d="M 370 170 Q 470 100 565 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 370 170 Q 470 100 565 100"
              fill="none"
              stroke={hoveredNode === "webhooks" ? "#10b981" : "#94a3b8"}
              strokeWidth={hoveredNode === "webhooks" ? "3" : "2"}
              strokeDasharray="6 20"
              className="animate-dash"
            />

            {/* Hub to SQS */}
            <path
              d="M 370 170 H 560"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 370 170 H 560"
              fill="none"
              stroke={hoveredNode === "sqs" ? "#f59e0b" : "#94a3b8"}
              strokeWidth={hoveredNode === "sqs" ? "3" : "2"}
              strokeDasharray="6 20"
              className="animate-dash"
            />

            {/* Hub to DB */}
            <path
              d="M 370 170 Q 470 240 560 240"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 370 170 Q 470 240 560 240"
              fill="none"
              stroke={hoveredNode === "db" ? "#a855f7" : "#94a3b8"}
              strokeWidth={hoveredNode === "db" ? "3" : "2"}
              strokeDasharray="6 20"
              className="animate-dash"
            />
          </svg>

          {/* Node Grid Layout */}
          <div className="relative z-10 flex w-full max-w-xl items-center justify-between">
            {/* Input Trigger */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm">
                <div className="animate-pulse rounded bg-blue-500/10 p-1 text-blue-600">
                  <Terminal className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  API PLATFORM
                </span>
              </div>
            </div>

            {/* Central HookRelay Hub */}
            <div className="relative">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg ring-8 shadow-blue-500/30 ring-blue-600/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-25 blur" />
            </div>

            {/* Outbound Destinations */}
            <div className="flex flex-col gap-6">
              {/* Webhooks */}
              <div
                onMouseEnter={() => setHoveredNode("webhooks")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`flex cursor-pointer items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-all duration-200 ${
                  hoveredNode === "webhooks"
                    ? "scale-105 border-emerald-500"
                    : ""
                }`}
              >
                <div className="rounded bg-emerald-500/10 p-1 text-emerald-600">
                  <Globe className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  WEBHOOKS
                </span>
              </div>

              {/* AWS SQS */}
              <div
                onMouseEnter={() => setHoveredNode("sqs")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`flex cursor-pointer items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-all duration-200 ${
                  hoveredNode === "sqs" ? "scale-105 border-amber-500" : ""
                }`}
              >
                <div className="rounded bg-amber-500/10 p-1 text-amber-600">
                  <Gear className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  AWS SQS
                </span>
              </div>

              {/* Database Storage */}
              <div
                onMouseEnter={() => setHoveredNode("db")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`flex cursor-pointer items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-all duration-200 ${
                  hoveredNode === "db" ? "scale-105 border-purple-500" : ""
                }`}
              >
                <div className="rounded bg-purple-500/10 p-1 text-purple-600">
                  <Database className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  HOOKRELAY DB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Text Column (Right) */}
        <div className="order-1 flex flex-col justify-center text-left lg:order-2 lg:col-span-5">
          <div className="mb-2 font-mono text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Send Webhooks
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Outpost Dispatcher
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Deliver webhook alerts seamlessly. Manage subscriber routing
            patterns, verify deliveries, configure authentication payloads, and
            monitor success statistics easily.
          </p>
          <div className="flex gap-4">
            <Button className="rounded-full bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-500/10 hover:bg-indigo-700">
              Configure Outpost
            </Button>
            <Button variant="outline" className="rounded-full">
              Explore Destinations
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid (3 Columns) */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Card 1: Subscription API */}
        <Card className="relative flex flex-col justify-between overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Terminal className="size-5 text-blue-600" />
              <h3 className="text-base font-bold">
                Register Endpoint Subscriptions
              </h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Create and manage consumer endpoints dynamically via HTTP
              requests. Protect connections with shared secrets.
            </p>
          </div>
          <div className="mt-auto px-6 pb-6">
            {/* Command Widget */}
            <div className="relative overflow-hidden rounded-lg border border-border/80 bg-muted/40 p-4 font-mono text-[10px] leading-relaxed text-foreground/80">
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 rounded border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Copy Curl Command"
              >
                {copied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
              <pre className="whitespace-pre-wrap text-foreground/90 select-all">
                {curlCommand}
              </pre>
            </div>
          </div>
        </Card>

        {/* Card 2: Publish Routing */}
        <Card className="relative flex flex-col justify-between overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <PaperPlane className="size-5 text-indigo-600" />
              <h3 className="text-base font-bold">Filter Destination Events</h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Selectively trigger endpoints by defining filters. Consumers will
              only capture events matching their filter array.
            </p>
          </div>
          <div className="mt-auto px-6 pb-6">
            {/* Event selection simulator */}
            <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/40 p-4">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                EVENT SOURCE TRIGGERS
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveEvent("created")}
                  className={`rounded border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                    activeEvent === "created"
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  order.created
                </button>

                <button
                  onClick={() => setActiveEvent("updated")}
                  className={`rounded border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                    activeEvent === "updated"
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  order.updated
                </button>
              </div>

              <div className="rounded border bg-background/50 p-2.5 font-mono text-[11px] text-muted-foreground">
                {activeEvent === "created" ? (
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <Circle weight="fill" className="size-2 animate-ping" />
                    Delivering order.created event to WEBHOOKS & AWS SQS
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Circle weight="fill" className="size-2 animate-ping" />
                    Delivering order.updated event to WEBHOOKS & DATABASE
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Debug Portal */}
        <Card className="relative flex flex-col justify-between overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-600" />
              <h3 className="text-base font-bold">
                Consumer Debugging Dashboard
              </h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Offer your customers a dedicated portal to view logs, trace
              payloads, inspect retry headers, and verify delivery success
              metrics.
            </p>
          </div>
          <div className="mt-auto px-6 pb-6">
            {/* Mini Portal Logs Grid */}
            <div className="flex flex-col gap-2 rounded-lg border border-border/80 bg-muted/40 p-3 font-mono text-[10px]">
              <div className="flex justify-between border-b border-border/60 pb-1.5 font-semibold text-muted-foreground">
                <span>DESTINATION</span>
                <span>SUCCESS</span>
                <span>LATENCY</span>
              </div>
              <div className="flex items-center justify-between text-foreground/80">
                <span className="font-medium text-blue-600">
                  https://api.client...
                </span>
                <span className="font-bold text-emerald-500">99.9%</span>
                <span>124ms</span>
              </div>
              <div className="flex items-center justify-between text-foreground/80">
                <span className="font-medium text-amber-600">
                  AWS SQS Target
                </span>
                <span className="font-bold text-emerald-500">100.0%</span>
                <span>12ms</span>
              </div>
              <div className="flex items-center justify-between text-foreground/80">
                <span className="font-medium text-purple-600">
                  Internal Storage
                </span>
                <span className="font-bold text-emerald-500">100.0%</span>
                <span>8ms</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
        .animate-dash {
          animation: dash 2.5s linear infinite;
        }
      `}</style>
    </section>
  );
}
