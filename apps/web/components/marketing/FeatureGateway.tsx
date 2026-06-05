"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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

function StoreIcon(props: any) {
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

export function FeatureGateway() {
  const [retryState, setRetryState] = useState<"idle" | "loading" | "success">(
    "idle"
  );
  const [activeTab, setActiveTab] = useState<"shopify" | "stripe" | "twilio">(
    "shopify"
  );

  const handleRetry = () => {
    setRetryState("loading");
    setTimeout(() => {
      setRetryState("success");
      setTimeout(() => setRetryState("idle"), 2000);
    }, 1500);
  };

  return (
    <section className="mx-auto w-full max-w-7xl border-t border-border/50 px-4 py-20">
      {/* Event Gateway Hero Row */}
      <div className="mb-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="flex flex-col justify-center text-left lg:col-span-5">
          <div className="mb-2 font-mono text-xs font-bold tracking-widest text-blue-600 uppercase">
            Receive Webhooks
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Event Gateway
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Ingest and route inbound webhooks and events before they hit your
            application servers. Rest assured knowing every single payload is
            safely buffered with absolute observability and control.
          </p>
          <div className="flex gap-4">
            <Button className="rounded-full bg-blue-600 font-semibold text-white hover:bg-blue-700">
              Start Ingesting
            </Button>
            <Button variant="outline" className="rounded-full">
              Learn More
            </Button>
          </div>
        </div>

        {/* Diagram Column */}
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 p-8 lg:col-span-7">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:10px_10px]" />

          {/* SVG Animated Lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shopify to Hub */}
            <path
              id="shopify-path"
              d="M 140 70 Q 230 70 330 150"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 140 70 Q 230 70 330 150"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="6 20"
              className="animate-dash"
            />

            {/* Stripe to Hub */}
            <path
              id="stripe-path"
              d="M 140 160 H 330"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 140 160 H 330"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="6 20"
              className="animate-dash"
            />

            {/* Twilio to Hub */}
            <path
              id="twilio-path"
              d="M 140 250 Q 230 250 330 170"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 140 250 Q 230 250 330 170"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="6 20"
              className="animate-dash"
            />

            {/* Hub to Local */}
            <path
              d="M 370 160 Q 470 150 560 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 370 160 Q 470 150 560 70"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="6 20"
              className="animate-dash"
            />

            {/* Hub to HTTP */}
            <path
              d="M 370 160 H 560"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 370 160 H 560"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="6 20"
              className="animate-dash"
            />

            {/* Hub to Mock API */}
            <path
              d="M 370 160 Q 470 170 560 250"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500/20"
            />
            <path
              d="M 370 160 Q 470 170 560 250"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="6 20"
              className="animate-dash"
            />
          </svg>

          {/* Node Grid Layout */}
          <div className="relative z-10 flex w-full max-w-xl items-center justify-between">
            {/* Inbound Sources */}
            <div className="flex flex-col gap-6">
              {/* Shopify */}
              <div
                onClick={() => setActiveTab("shopify")}
                className={`flex cursor-pointer items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-all duration-200 ${
                  activeTab === "shopify"
                    ? "scale-105 border-blue-500 ring-2 ring-blue-500/10"
                    : "hover:border-border-hover"
                }`}
              >
                <div className="rounded bg-[#96BF48]/10 p-1 text-[#96BF48]">
                  <StoreIcon className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  shopify
                </span>
              </div>

              {/* Stripe */}
              <div
                onClick={() => setActiveTab("stripe")}
                className={`flex cursor-pointer items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-all duration-200 ${
                  activeTab === "stripe"
                    ? "scale-105 border-indigo-500 ring-2 ring-indigo-500/10"
                    : "hover:border-border-hover"
                }`}
              >
                <div className="rounded bg-[#635BFF]/10 p-1 text-[#635BFF]">
                  <Coins className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  stripe
                </span>
              </div>

              {/* Twilio */}
              <div
                onClick={() => setActiveTab("twilio")}
                className={`flex cursor-pointer items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-all duration-200 ${
                  activeTab === "twilio"
                    ? "scale-105 border-red-500 ring-2 ring-red-500/10"
                    : "hover:border-border-hover"
                }`}
              >
                <div className="rounded bg-[#F22F46]/10 p-1 text-[#F22F46]">
                  <Cpu className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  twilio
                </span>
              </div>
            </div>

            {/* Central HookRelay Hub */}
            <div className="relative">
              <div className="flex size-14 animate-pulse items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg ring-8 shadow-blue-500/30 ring-blue-600/5">
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
              {/* Pulsing glow halos */}
              <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-25 blur" />
            </div>

            {/* Outbound Destinations */}
            <div className="flex flex-col gap-6">
              {/* Local */}
              <div className="hover:border-border-hover flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-colors">
                <div className="rounded bg-emerald-500/10 p-1 text-emerald-600">
                  <DeviceRotate className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  LOCAL
                </span>
              </div>

              {/* HTTP */}
              <div className="hover:border-border-hover flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-colors">
                <div className="rounded bg-blue-500/10 p-1 text-blue-600">
                  <Globe className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  HTTP
                </span>
              </div>

              {/* Mock API */}
              <div className="hover:border-border-hover flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-colors">
                <div className="rounded bg-amber-500/10 p-1 text-amber-600">
                  <Gear className="size-4" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                  MOCK API
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid (3 Columns) */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Card 1: Filter, transform, and route */}
        <Card className="relative flex flex-col justify-between overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Funnel className="size-5 text-blue-600" />
              <h3 className="text-base font-bold">
                Filter, transform, and route
              </h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Apply powerful filter routing rules so endpoints only receive
              events they subscribe to.
            </p>
          </div>
          <div className="mt-auto px-6 pb-6">
            {/* Editor Block */}
            <div className="overflow-hidden rounded-lg border border-border/80 bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground/80">
              <div className="mb-2 flex justify-between border-b border-border/50 pb-1.5 text-blue-500/60">
                <span>FILTERING {activeTab.toUpperCase()} &rarr; LOCAL...</span>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <pre className="text-blue-600/80">
                {`{
  "eventTypeFilter": [
    "${activeTab === "shopify" ? "order.created" : activeTab === "stripe" ? "payment.succeeded" : "sms.delivered"}"
  ]
}`}
              </pre>
            </div>
          </div>
        </Card>

        {/* Card 2: Queue with rate control */}
        <Card className="relative flex flex-col justify-between overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Queue className="size-5 text-indigo-600" />
              <h3 className="text-base font-bold">Queue with rate control</h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Smooth out spike traffic and rate limit outbound deliveries.
              Protect downstream databases.
            </p>
          </div>
          <div className="mt-auto px-6 pb-6">
            {/* Queue Visualization */}
            <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/40 p-4">
              <div className="flex items-center justify-between font-mono text-xs font-semibold text-muted-foreground">
                <span>DELIVERY RATE</span>
                <span className="font-bold text-indigo-600">150 req/min</span>
              </div>
              <div className="relative flex h-8 w-full items-center gap-1 overflow-hidden rounded-md bg-border/40 p-1">
                {/* Visual queued message blocks */}
                <div className="flex h-full w-8 animate-pulse items-center justify-center rounded-sm border border-blue-500/50 bg-blue-600/25 font-mono text-[9px] text-blue-600">
                  Q
                </div>
                <div className="flex h-full w-8 animate-pulse items-center justify-center rounded-sm border border-indigo-500/50 bg-indigo-600/25 font-mono text-[9px] text-indigo-600">
                  Q
                </div>
                <div className="flex h-full w-8 animate-pulse items-center justify-center rounded-sm border border-purple-500/50 bg-purple-600/25 font-mono text-[9px] text-purple-600">
                  Q
                </div>
                <div className="flex h-full w-8 items-center justify-center rounded-sm bg-border/50 font-mono text-[9px] text-muted-foreground">
                  ..
                </div>

                {/* Slow queue delivery animation indicators */}
                <div className="absolute right-2 flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/30">
                <div
                  className="h-full animate-[progress_3s_ease-in-out_infinite] rounded-full bg-indigo-600"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Auto-detect issues and replay */}
        <Card className="relative flex flex-col justify-between overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <ArrowClockwise className="size-5 text-emerald-600" />
              <h3 className="text-base font-bold">
                Auto-detect issues & retry
              </h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Track request statuses instantly. Automatically retries events
              with exponential backoff on failure.
            </p>
          </div>
          <div className="mt-auto px-6 pb-6">
            {/* Failure Box */}
            <div className="flex flex-col gap-3 rounded-lg border border-red-200/50 bg-red-500/5 p-4 dark:border-red-950/40">
              <div className="flex items-center justify-between font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                <span className="flex items-center gap-1.5">
                  <XCircle className="size-4" />
                  HTTP 502 Bad Gateway
                </span>
                <span>Attempts: 3</span>
              </div>
              <div className="font-mono text-[10px] leading-normal break-all text-muted-foreground">
                {`{"type": "delivery_failed", "url": "https://api.myapp.com/webhooks"}`}
              </div>

              <Button
                onClick={handleRetry}
                disabled={retryState === "loading"}
                className={`h-8 w-full rounded border py-1.5 font-mono text-xs transition-all ${
                  retryState === "success"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {retryState === "idle" && (
                  <span className="flex items-center justify-center gap-1.5">
                    <ArrowClockwise className="size-3.5" />
                    Retry Event
                  </span>
                )}
                {retryState === "loading" && (
                  <span className="flex animate-spin items-center justify-center gap-1.5">
                    <ArrowClockwise className="size-3.5" />
                  </span>
                )}
                {retryState === "success" && (
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckCircle className="size-3.5" />
                    Replay Successful!
                  </span>
                )}
              </Button>
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
        @keyframes progress {
          0%,
          100% {
            width: 30%;
          }
          50% {
            width: 85%;
          }
        }
      `}</style>
    </section>
  );
}
