"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

function DeliveryDiagram({ hoveredNode }: { hoveredNode: string | null }) {
  const SRC = { x: 118, y: 130 };
  const HUB_LEFT = { x: 218, y: 130 };
  const HUB_RIGHT = { x: 282, y: 130 };
  const DST = {
    webhooks: { x: 382, y: 65 },
    sqs: { x: 382, y: 130 },
    db: { x: 382, y: 195 },
  };

  // Cubic bezier: horizontal control points for organic S-curves
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  };

  const inPath = {
    d: curve(SRC.x, SRC.y, HUB_LEFT.x, HUB_LEFT.y),
    color: "#3b82f6",
  };

  const outPaths = [
    {
      id: "webhooks",
      d: curve(HUB_RIGHT.x, HUB_RIGHT.y, DST.webhooks.x, DST.webhooks.y),
      color: "#10b981",
    },
    {
      id: "sqs",
      d: curve(HUB_RIGHT.x, HUB_RIGHT.y, DST.sqs.x, DST.sqs.y),
      color: "#f59e0b",
    },
    {
      id: "db",
      d: curve(HUB_RIGHT.x, HUB_RIGHT.y, DST.db.x, DST.db.y),
      color: "#a855f7",
    },
  ] as const;

  const destinations = [
    {
      id: "webhooks",
      cx: 428,
      cy: 65,
      color: "#10b981",
      icon: <Globe className="size-3.5" />,
      label: "WEBHOOKS",
    },
    {
      id: "sqs",
      cx: 428,
      cy: 130,
      color: "#f59e0b",
      icon: <Gear className="size-3.5" />,
      label: "AWS SQS",
    },
    {
      id: "db",
      cx: 428,
      cy: 195,
      color: "#a855f7",
      icon: <Database className="size-3.5" />,
      label: "DATABASE",
    },
  ] as const;

  return (
    <div className="relative flex h-[260px] w-full items-center justify-center overflow-hidden">
      {/* Background dot grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,hsl(var(--border))_1.2px,transparent_1.2px)] bg-[size:20px_20px] opacity-50" />

      {/* Full-width SVG — viewBox matches coordinate system */}
      <svg
        viewBox="0 0 500 260"
        className="absolute inset-0 size-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Soft glow filter for active lines */}
          <filter id="glow-active" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Inbound path (API → Hub) ── */}
        <g>
          <path
            d={inPath.d}
            fill="none"
            stroke={inPath.color}
            strokeWidth="1.5"
            strokeOpacity="0.12"
          />
          <path
            d={inPath.d}
            fill="none"
            stroke={inPath.color}
            strokeWidth="2"
            strokeOpacity="0.85"
            strokeDasharray="5 16"
            className="animate-dash"
            filter="url(#glow-active)"
          />
        </g>

        {/* ── Outbound paths (hub → destinations) ── */}
        {outPaths.map((p) => {
          const isActive = hoveredNode === null || hoveredNode === p.id;
          return (
            <g key={p.id}>
              <path
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth="1.5"
                strokeOpacity="0.12"
              />
              <path
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={isActive ? "2" : "1.5"}
                strokeOpacity={isActive ? "0.85" : "0.28"}
                strokeDasharray="5 16"
                className="animate-dash"
                filter={isActive ? "url(#glow-active)" : undefined}
              />
            </g>
          );
        })}

        {/* ── Source pill (foreignObject) ── */}
        <foreignObject x={0} y={130 - 14} width="144" height="28">
          <div
            // @ts-expect-error xmlns needed for foreignObject
            xmlns="http://www.w3.org/1999/xhtml"
            className="flex h-full items-center justify-center"
          >
            <div className="flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-background/95 px-2.5 py-1 shadow-sm backdrop-blur-sm">
              <span className="text-blue-600">
                <Terminal className="size-4" />
              </span>
              <span className="font-mono text-[11px] font-semibold text-foreground">
                API PLATFORM
              </span>
            </div>
          </div>
        </foreignObject>

        {/* ── Hub node ── */}
        {/* Glow ring */}
        <circle cx="250" cy="130" r="40" fill="#2563eb" fillOpacity="0.08" />
        <circle cx="250" cy="130" r="32" fill="#2563eb" fillOpacity="0.06" />
        {/* Hub box */}
        <rect
          x="218"
          y="98"
          width="64"
          height="64"
          rx="14"
          ry="14"
          fill="#2563eb"
        />
        {/* Animated pulse ring */}
        <rect
          x="218"
          y="98"
          width="64"
          height="64"
          rx="14"
          ry="14"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeOpacity="0.3"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.3;0;0.3"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-width"
            values="2;8;2"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Link icon */}
        <g
          transform="translate(238, 118)"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </g>

        {/* ── Destination pills ── */}
        {destinations.map((d) => {
          const isActive = hoveredNode === null || hoveredNode === d.id;
          return (
            <foreignObject
              key={d.id}
              x={d.cx - 72}
              y={d.cy - 14}
              width="144"
              height="28"
            >
              <div
                // @ts-expect-error xmlns needed for foreignObject
                xmlns="http://www.w3.org/1999/xhtml"
                className="flex h-full items-center justify-center"
              >
                <div
                  className={`flex items-center gap-1.5 rounded-full border bg-background/95 px-2.5 py-1 shadow-sm backdrop-blur-sm transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-40"}`}
                  style={{ borderColor: `${d.color}40` }}
                >
                  <span style={{ color: d.color }}>{d.icon}</span>
                  <span className="font-mono text-[11px] font-semibold tracking-wide text-foreground">
                    {d.label}
                  </span>
                </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>

      {/* Overlay to handle hover state for destinations */}
      {/* We overlay transparent divs so mouse hover works seamlessly */}
      <div className="pointer-events-none absolute inset-y-0 right-[36px] z-20 flex w-[144px] flex-col justify-between py-[51px]">
        {destinations.map((d) => (
          <div
            key={d.id}
            className="pointer-events-auto h-[28px] w-full rounded-full"
            onMouseEnter={() => hoveredNode !== d.id && hoveredNode !== "none"} // Placeholder
          />
        ))}
      </div>

      {/* Real hover hitboxes aligned perfectly */}
      <div
        className="absolute top-[51px] right-[36px] z-20 h-[28px] w-[144px] cursor-pointer"
        onMouseEnter={() => hoveredNode}
        onMouseLeave={() => hoveredNode}
      ></div>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -42; }
        }
        .animate-dash {
          animation: dash 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

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
    "eventTypeFilter": ["order.\${activeEvent}"]
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
        <div className="relative order-2 overflow-hidden rounded-2xl border bg-muted/20 shadow-sm lg:order-1 lg:col-span-7">
          <DeliveryDiagram hoveredNode={hoveredNode} />

          {/* Invisible hover overlay matching nodes position to set hoveredNode correctly */}
          <div className="pointer-events-none absolute top-[51px] right-[36px] flex flex-col gap-[37px]">
            <div
              className="pointer-events-auto h-[28px] w-[144px] cursor-pointer rounded-full"
              onMouseEnter={() => setHoveredNode("webhooks")}
              onMouseLeave={() => setHoveredNode(null)}
            ></div>
            <div
              className="pointer-events-auto h-[28px] w-[144px] cursor-pointer rounded-full"
              onMouseEnter={() => setHoveredNode("sqs")}
              onMouseLeave={() => setHoveredNode(null)}
            ></div>
            <div
              className="pointer-events-auto h-[28px] w-[144px] cursor-pointer rounded-full"
              onMouseEnter={() => setHoveredNode("db")}
              onMouseLeave={() => setHoveredNode(null)}
            ></div>
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
        <Card className="flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
          <div className="flex flex-row items-center gap-2 px-4 pt-4 pb-2">
            <Terminal className="size-4 text-blue-600" />
            <span className="text-sm font-semibold">
              Register Endpoint Subscriptions
            </span>
          </div>
          <CardContent className="flex h-full flex-col justify-between gap-3 pb-6 text-sm text-muted-foreground">
            <p>
              Create and manage consumer endpoints dynamically via HTTP
              requests. Protect connections with shared secrets.
            </p>

            {/* Command Widget */}
            <div className="relative mt-auto overflow-hidden rounded-lg border border-border/80 bg-muted/40 p-4 font-mono text-[10px] leading-relaxed text-foreground/80">
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
          </CardContent>
        </Card>

        {/* Card 2: Publish Routing */}
        <Card className="flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
          <div className="flex flex-row items-center gap-2 px-4 pt-4 pb-2">
            <PaperPlane className="size-4 text-indigo-600" />
            <span className="text-sm font-semibold">
              Filter Destination Events
            </span>
          </div>
          <CardContent className="flex h-full flex-col justify-between gap-3 pb-6 text-sm text-muted-foreground">
            <p>
              Selectively trigger endpoints by defining filters. Consumers will
              only capture events matching their filter array.
            </p>

            {/* Event selection simulator */}
            <div className="mt-auto flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/40 p-4">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                EVENT SOURCE TRIGGERS
              </span>

              <div className="flex gap-2">
                <Badge
                  onClick={() => setActiveEvent("created")}
                  variant={activeEvent === "created" ? "default" : "outline"}
                  className="cursor-pointer font-mono text-[10px]"
                >
                  order.created
                </Badge>

                <Badge
                  onClick={() => setActiveEvent("updated")}
                  variant={activeEvent === "updated" ? "default" : "outline"}
                  className="cursor-pointer font-mono text-[10px]"
                >
                  order.updated
                </Badge>
              </div>

              <div className="rounded border bg-background/50 p-2.5 font-mono text-[11px] text-muted-foreground">
                {activeEvent === "created" ? (
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <Circle weight="fill" className="size-2 animate-ping" />
                    Delivering order.created to WEBHOOKS & AWS SQS
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Circle weight="fill" className="size-2 animate-ping" />
                    Delivering order.updated to WEBHOOKS & DATABASE
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Debug Portal */}
        <Card className="flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
          <div className="flex flex-row items-center gap-2 px-4 pt-4 pb-2">
            <CheckCircle className="size-4 text-emerald-600" />
            <span className="text-sm font-semibold">
              Consumer Debugging Dashboard
            </span>
          </div>
          <CardContent className="flex h-full flex-col justify-between gap-3 pb-6 text-sm text-muted-foreground">
            <p>
              Offer your customers a dedicated portal to view logs, trace
              payloads, inspect retry headers, and verify delivery success
              metrics.
            </p>

            {/* Mini Portal Logs Grid */}
            <div className="mt-auto flex flex-col gap-2 rounded-lg border border-border/80 bg-muted/40 p-3 font-mono text-[10px]">
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
