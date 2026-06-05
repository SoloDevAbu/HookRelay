"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Funnel,
  Queue,
  ArrowClockwise,
  CheckCircle,
  XCircle,
  Coins,
  Cpu,
  Globe,
  DeviceRotate,
  Gear,
} from "@phosphor-icons/react";

function StoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12V9" />
      <path d="M10 12V9" />
      <path d="M14 12V9" />
      <path d="M20 12V9" />
      <path d="M2 7v10a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4V7" />
      <path d="M16 17a4 4 0 0 1-8 0" />
    </svg>
  );
}

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
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
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// Pure declarative SVG diagram — viewBox coordinates matching the screenshot layout precisely
function GatewayDiagram({ activeSource }: { activeSource: "shopify" | "stripe" | "twilio" }) {
  // ── Coordinate system: viewBox="0 0 500 260" ──────────────────────
  // Sources (right-edge of pill): x=118, y=65 / 130 / 195
  // Hub (left-edge): x=218, center: x=250, y=130. Right-edge: x=282
  // Destinations (left-edge of pill): x=382, y=65 / 130 / 195

  // Source pill right-edge points
  const SRC = { shopify: { x: 118, y: 65 }, stripe: { x: 118, y: 130 }, twilio: { x: 118, y: 195 } };
  // Destination pill left-edge points
  const DST = { local: { x: 382, y: 65 }, http: { x: 382, y: 130 }, mock: { x: 382, y: 195 } };
  // Hub edges
  const HUB_LEFT = { x: 218, y: 130 };
  const HUB_RIGHT = { x: 282, y: 130 };

  // Cubic bezier: horizontal control points for organic S-curves
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  };

  const inPaths = [
    { id: "shopify", d: curve(SRC.shopify.x, SRC.shopify.y, HUB_LEFT.x, HUB_LEFT.y), color: "#96BF48" },
    { id: "stripe",  d: curve(SRC.stripe.x,  SRC.stripe.y,  HUB_LEFT.x, HUB_LEFT.y), color: "#635BFF" },
    { id: "twilio",  d: curve(SRC.twilio.x,  SRC.twilio.y,  HUB_LEFT.x, HUB_LEFT.y), color: "#F22F46" },
  ] as const;

  const outPaths = [
    { id: "local", d: curve(HUB_RIGHT.x, HUB_RIGHT.y, DST.local.x, DST.local.y), color: "#10b981" },
    { id: "http",  d: curve(HUB_RIGHT.x, HUB_RIGHT.y, DST.http.x,  DST.http.y),  color: "#3b82f6" },
    { id: "mock",  d: curve(HUB_RIGHT.x, HUB_RIGHT.y, DST.mock.x,  DST.mock.y),  color: "#f59e0b" },
  ] as const;

  // Source node definitions — pill position: center x=72, y matches SRC y
  const sources = [
    { id: "shopify", cx: 72, cy: 65,  color: "#96BF48", icon: <StoreIcon className="size-4" />, label: "shopify" },
    { id: "stripe",  cx: 72, cy: 130, color: "#635BFF", icon: <Coins className="size-4" />,     label: "stripe"  },
    { id: "twilio",  cx: 72, cy: 195, color: "#F22F46", icon: <Cpu className="size-4" />,       label: "twilio"  },
  ] as const;

  // Destination node definitions — pill position: center x=428, y matches DST y
  const destinations = [
    { id: "local", cx: 428, cy: 65,  color: "#10b981", icon: <DeviceRotate className="size-3.5" />, label: "LOCAL"    },
    { id: "http",  cx: 428, cy: 130, color: "#3b82f6", icon: <Globe className="size-3.5" />,        label: "HTTP"     },
    { id: "mock",  cx: 428, cy: 195, color: "#f59e0b", icon: <Gear className="size-3.5" />,         label: "MOCK API" },
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

        {/* ── Inbound paths (sources → hub) ── */}
        {inPaths.map((p) => {
          const isActive = activeSource === p.id;
          return (
            <g key={p.id}>
              {/* Ghost track */}
              <path d={p.d} fill="none" stroke={p.color} strokeWidth="1.5" strokeOpacity="0.12" />
              {/* Animated dash */}
              <path
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={isActive ? "2" : "1.5"}
                strokeOpacity={isActive ? "1" : "0.28"}
                strokeDasharray="5 16"
                className="animate-dash"
                filter={isActive ? "url(#glow-active)" : undefined}
              />
            </g>
          );
        })}

        {/* ── Outbound paths (hub → destinations) ── */}
        {outPaths.map((p) => (
          <g key={p.id}>
            <path d={p.d} fill="none" stroke={p.color} strokeWidth="1.5" strokeOpacity="0.12" />
            <path
              d={p.d}
              fill="none"
              stroke={p.color}
              strokeWidth="2"
              strokeOpacity="0.85"
              strokeDasharray="5 16"
              className="animate-dash"
              filter="url(#glow-active)"
            />
          </g>
        ))}

        {/* ── Source pills (foreignObject for React nodes) ── */}
        {sources.map((s) => (
          <foreignObject
            key={s.id}
            x={s.cx - 72}
            y={s.cy - 14}
            width="144"
            height="28"
          >
            <div
              // @ts-expect-error xmlns needed for foreignObject
              xmlns="http://www.w3.org/1999/xhtml"
              className="flex h-full items-center justify-center"
            >
              <div
                className="flex items-center gap-1.5 rounded-full border bg-background/95 px-2.5 py-1 shadow-sm backdrop-blur-sm"
                style={{ borderColor: `${s.color}40` }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="font-mono text-[11px] font-semibold text-foreground">{s.label}</span>
              </div>
            </div>
          </foreignObject>
        ))}

        {/* ── Hub node ── */}
        {/* Glow ring */}
        <circle cx="250" cy="130" r="40" fill="#2563eb" fillOpacity="0.08" />
        <circle cx="250" cy="130" r="32" fill="#2563eb" fillOpacity="0.06" />
        {/* Hub box */}
        <rect x="218" y="98" width="64" height="64" rx="14" ry="14" fill="#2563eb" />
        {/* Animated pulse ring */}
        <rect x="218" y="98" width="64" height="64" rx="14" ry="14" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.3">
          <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="stroke-width" values="2;8;2" dur="2.5s" repeatCount="indefinite" />
        </rect>
        {/* Link icon — two arc paths centered in hub */}
        <g transform="translate(238, 118)" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </g>

        {/* ── Destination pills ── */}
        {destinations.map((d) => (
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
                className="flex items-center gap-1.5 rounded-full border bg-background/95 px-2.5 py-1 shadow-sm backdrop-blur-sm"
                style={{ borderColor: `${d.color}40` }}
              >
                <span style={{ color: d.color }}>{d.icon}</span>
                <span className="font-mono text-[11px] font-semibold tracking-wide text-foreground">{d.label}</span>
              </div>
            </div>
          </foreignObject>
        ))}
      </svg>

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

export function FeatureGateway() {
  const [retryState, setRetryState] = useState<"idle" | "loading" | "success">("idle");
  const [activeSource, setActiveSource] = useState<"shopify" | "stripe" | "twilio">("shopify");

  const handleRetry = () => {
    setRetryState("loading");
    setTimeout(() => {
      setRetryState("success");
      setTimeout(() => setRetryState("idle"), 2000);
    }, 1500);
  };

  return (
    <section className="mx-auto w-full max-w-7xl border-t border-border/50 px-4 py-20">

      {/* Hero Row */}
      <div className="mb-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">

        {/* Left: Copy */}
        <div className="flex flex-col justify-center text-left lg:col-span-5">
          <div className="mb-2 font-mono text-xs font-bold tracking-widest text-blue-600 uppercase">
            Receive Webhooks
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Event Gateway
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Ingest and route inbound webhooks and events before they hit your
            application servers. Every payload is safely buffered with full
            observability and control.
          </p>
          <div className="flex gap-3">
            <Button className="rounded-full bg-blue-600 font-semibold text-white hover:bg-blue-700">
              Start Ingesting
            </Button>
            <Button variant="outline" className="rounded-full">
              Learn More
            </Button>
          </div>
        </div>

        {/* Right: Diagram */}
        <div className="relative overflow-hidden rounded-2xl border bg-muted/20 shadow-sm lg:col-span-7">
          <GatewayDiagram activeSource={activeSource} />
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* Card 1: Filter */}
        <Card className="flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
          <div className="flex flex-row items-center gap-2 px-4 pt-4 pb-2">
            <Funnel className="size-4 text-blue-600" />
            <span className="text-sm font-semibold">Filter, transform, and route</span>
          </div>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>Apply powerful filter rules so endpoints only receive events they subscribed to.</p>

            {/* Source selector pills */}
            <div className="flex flex-wrap gap-2">
              {(["shopify", "stripe", "twilio"] as const).map((s) => (
                <Badge
                  key={s}
                  variant={activeSource === s ? "default" : "outline"}
                  className="cursor-pointer rounded-full font-mono text-xs"
                  onClick={() => setActiveSource(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>

            {/* Code preview */}
            <div className="overflow-hidden rounded-lg border bg-muted/50 p-3 font-mono text-xs leading-relaxed">
              <div className="mb-1.5 flex items-center justify-between border-b border-border/50 pb-1 text-[10px] text-blue-500/70">
                <span>FILTERING {activeSource.toUpperCase()} → LOCAL</span>
                <span className="size-1.5 rounded-full bg-emerald-500" />
              </div>
              <pre className="text-blue-600/80">{`{
  "eventTypeFilter": [
    "${activeSource === "shopify" ? "order.created" : activeSource === "stripe" ? "payment.succeeded" : "sms.delivered"}"
  ]
}`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Queue */}
        <Card className="flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
          <div className="flex flex-row items-center gap-2 px-4 pt-4 pb-2">
            <Queue className="size-4 text-indigo-600" />
            <span className="text-sm font-semibold">Queue with rate control</span>
          </div>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>Smooth spike traffic and rate-limit outbound deliveries. Protect downstream services.</p>

            {/* Queue visual */}
            <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between font-mono text-xs font-semibold text-muted-foreground">
                <span>DELIVERY RATE</span>
                <span className="font-bold text-indigo-600">150 req/min</span>
              </div>
              <div className="relative flex h-7 w-full items-center gap-1 overflow-hidden rounded-md bg-border/30 px-1">
                {[
                  { color: "blue", label: "Q" },
                  { color: "indigo", label: "Q" },
                  { color: "purple", label: "Q" },
                  { color: "muted", label: "·" },
                ].map((b, i) => (
                  <div
                    key={i}
                    className={`flex h-5 w-7 shrink-0 items-center justify-center rounded font-mono text-[9px] ${
                      b.color === "blue"
                        ? "border border-blue-500/40 bg-blue-600/20 text-blue-600 animate-pulse"
                        : b.color === "indigo"
                          ? "border border-indigo-500/40 bg-indigo-600/20 text-indigo-600 animate-pulse"
                          : b.color === "purple"
                            ? "border border-purple-500/40 bg-purple-600/20 text-purple-600 animate-pulse"
                            : "bg-border/50 text-muted-foreground"
                    }`}
                  >
                    {b.label}
                  </div>
                ))}
                <div className="absolute right-1.5 flex items-center gap-0.5">
                  <span className="size-1.5 animate-ping rounded-full bg-emerald-500" />
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/30">
                <div
                  className="h-full animate-[progress_3s_ease-in-out_infinite] rounded-full bg-indigo-600"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Retry */}
        <Card className="flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
          <div className="flex flex-row items-center gap-2 px-4 pt-4 pb-2">
            <ArrowClockwise className="size-4 text-emerald-600" />
            <span className="text-sm font-semibold">Auto-detect issues &amp; retry</span>
          </div>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>Track request statuses instantly. Retry events automatically with fixed backoff on failure.</p>

            {/* Error box */}
            <div className="flex flex-col gap-3 rounded-lg border border-red-200/50 bg-red-500/5 p-3 dark:border-red-950/40">
              <div className="flex items-center justify-between font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                <span className="flex items-center gap-1.5">
                  <XCircle className="size-3.5" />
                  HTTP 502 Bad Gateway
                </span>
                <Badge variant="outline" className="font-mono text-[10px] text-red-500 border-red-300/50">
                  Attempts: 3
                </Badge>
              </div>
              <div className="font-mono text-[10px] leading-normal break-all text-muted-foreground">
                {`{"type": "delivery_failed", "url": "https://api.myapp.com/webhooks"}`}
              </div>
              <Button
                onClick={handleRetry}
                disabled={retryState === "loading"}
                variant="outline"
                className={`h-7 w-full rounded font-mono text-xs transition-all ${
                  retryState === "success"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                    : ""
                }`}
              >
                {retryState === "idle" && (
                  <span className="flex items-center gap-1.5">
                    <ArrowClockwise className="size-3" />
                    Retry Event
                  </span>
                )}
                {retryState === "loading" && (
                  <ArrowClockwise className="size-3 animate-spin" />
                )}
                {retryState === "success" && (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="size-3" />
                    Replay Successful!
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes progress {
          0%, 100% { width: 30%; }
          50% { width: 85%; }
        }
      `}</style>
    </section>
  );
}
