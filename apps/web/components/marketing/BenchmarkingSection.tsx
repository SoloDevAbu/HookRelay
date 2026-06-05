"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LightningIcon,
  TrendUpIcon,
  TimerIcon,
  ShieldCheckIcon,
  ShieldWarningIcon,
  FlameIcon,
  GraphIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

const mainStats = [
  {
    label: "Throughput Limit",
    value: "1,259 req/s",
    description: "Ramped over 200 concurrent VUs",
    icon: LightningIcon,
    color: "text-amber-500",
  },
  {
    label: "p50 Latency",
    value: "73 ms",
    description: "Standard database round-trip time",
    icon: TimerIcon,
    color: "text-blue-500",
  },
  {
    label: "p95 Latency",
    value: "166 ms",
    description: "Tail-end response time under load",
    icon: TimerIcon,
    color: "text-indigo-500",
  },
  {
    label: "HTTP Failure Rate",
    value: "0.00%",
    description: "No failed request delivery calls",
    icon: ShieldCheckIcon,
    color: "text-emerald-500",
  },
];

const optimizationHistory = [
  {
    stage: "Baseline Node API",
    p50: "247ms",
    p95: "709ms",
    error: "22.7%",
    throughput: "342 req/s",
    status: "Slow",
  },
  {
    stage: "+ Fastify schema & log tuning",
    p50: "190ms",
    p95: "444ms",
    error: "2.9%",
    throughput: "455 req/s",
    status: "Medium",
  },
  {
    stage: "+ Redis buffer & batch SQL",
    p50: "73ms",
    p95: "166ms",
    error: "0.12%",
    throughput: "1,259 req/s",
    status: "Optimal",
  },
];

export function BenchmarkingSection() {
  const [activeTab, setActiveTab] = useState<
    "throughput" | "history" | "ratelimit"
  >("throughput");

  return (
    <section className="mx-auto w-full max-w-7xl border-t border-border/50 px-4 py-20">
      {/* Title Header */}
      <div className="mb-16 text-center">
        <div className="mb-2 font-mono text-xs font-bold tracking-widest text-blue-600 uppercase">
          k6 Load Testing Benchmarks
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Built For High-Performance
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
          HookRelay is benchmarked to handle high-throughput event spikes using
          a fast, non-blocking asynchronous pipeline. Verified against 200
          concurrent Virtual Users.
        </p>

        {/* Tab Selector */}
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant={activeTab === "throughput" ? "default" : "outline"}
            onClick={() => setActiveTab("throughput")}
            className="rounded-full font-mono text-xs"
          >
            Ingestion Speed
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className="rounded-full font-mono text-xs"
          >
            Optimization Path
          </Button>
          <Button
            variant={activeTab === "ratelimit" ? "default" : "outline"}
            onClick={() => setActiveTab("ratelimit")}
            className="rounded-full font-mono text-xs"
          >
            Rate Limiter
          </Button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "throughput" && (
        <div>
          {/* Main Metrics Row */}
          <div className="animate-fade-in mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mainStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={i}
                  className="hover:border-border-hover flex flex-col justify-between border border-border bg-card p-6 shadow-sm transition-colors"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-muted-foreground uppercase">
                        {stat.label}
                      </span>
                      <Icon className={`size-5 ${stat.color}`} />
                    </div>
                    <div className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
                      {stat.value}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-normal text-muted-foreground">
                    {stat.description}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Detailed latency table visualizer */}
          <div className="grid grid-cols-1 items-center gap-8 rounded-xl border bg-muted/20 p-6 md:grid-cols-12">
            <div className="text-left md:col-span-5">
              <h3 className="mb-2 flex items-center gap-1.5 text-lg font-bold text-foreground">
                <FlameIcon className="size-5 text-red-500" />
                Ingestion Latency Profile
              </h3>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                By immediately queueing payloads into a Redis memory buffer and
                acknowledging the client, our HTTP response loops complete in
                milliseconds.
              </p>
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between border-b pb-1 text-muted-foreground">
                  <span>PERCENTILE</span>
                  <span>LATENCY</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>p50 (Median)</span>
                  <span className="font-bold text-foreground">73 ms</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>p90 (High)</span>
                  <span className="font-bold text-foreground">141 ms</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>p95 (Spikes)</span>
                  <span className="font-bold text-foreground">166 ms</span>
                </div>
                <div className="flex justify-between py-0.5 text-amber-600">
                  <span>p99 (Limiters)</span>
                  <span className="font-bold">~400 ms</span>
                </div>
              </div>
            </div>

            {/* Horizontal Latency Bar Chart */}
            <div className="flex flex-col gap-4 md:col-span-7">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-foreground">p50 Latency (73ms)</span>
                  <span className="text-muted-foreground">Fastest</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded bg-border/40">
                  <div
                    className="h-full rounded-r bg-blue-500"
                    style={{ width: "18%" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-foreground">p90 Latency (141ms)</span>
                  <span className="text-muted-foreground">Sustained</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded bg-border/40">
                  <div
                    className="h-full rounded-r bg-indigo-500"
                    style={{ width: "35%" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-foreground">p95 Latency (166ms)</span>
                  <span className="text-muted-foreground">Under Load</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded bg-border/40">
                  <div
                    className="h-full rounded-r bg-purple-500"
                    style={{ width: "42%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="animate-fade-in rounded-xl border bg-muted/20 p-6 text-left">
          <div className="mb-6 flex items-center gap-2">
            <GraphIcon className="size-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-foreground">
              Optimization Stages & Throughput Gains
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border/80 pb-2 text-foreground/80">
                  <th className="py-2.5 font-semibold">OPTIMIZATION STAGE</th>
                  <th className="py-2.5 font-semibold">p50 LATENCY</th>
                  <th className="py-2.5 font-semibold">p95 LATENCY</th>
                  <th className="py-2.5 font-semibold">ERROR RATE</th>
                  <th className="py-2.5 text-right font-semibold">
                    THROUGHPUT
                  </th>
                </tr>
              </thead>
              <tbody>
                {optimizationHistory.map((item, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border/40 ${item.status === "Optimal" ? "font-bold text-emerald-600" : ""}`}
                  >
                    <td className="py-3.5 font-semibold text-foreground">
                      {item.stage}
                    </td>
                    <td className="py-3.5">{item.p50}</td>
                    <td className="py-3.5">{item.p95}</td>
                    <td className="py-3.5">{item.error}</td>
                    <td className="py-3.5 text-right font-bold">
                      {item.throughput}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[10px] leading-normal text-muted-foreground italic">
            * Connection pool tuning (10 &rarr; 50), Fastify schema responses,
            Tenant API key caching, and BullMQ queues enabled 3.6x throughput
            gains relative to baseline Node API setup.
          </p>
        </div>
      )}

      {activeTab === "ratelimit" && (
        <div className="animate-fade-in grid grid-cols-1 items-center gap-8 rounded-xl border bg-muted/20 p-6 text-left md:grid-cols-12">
          <div className="md:col-span-6">
            <h3 className="mb-2 flex items-center gap-1.5 text-lg font-bold text-foreground">
              <ShieldWarningIcon className="size-5 text-indigo-600" />
              Lua-Based Fixed-Window Rate Limiter
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              Our rate limiter is implemented directly inside Redis using an
              atomic Lua script. In k6 validation tests against a tenant rate
              limit of 200 req/min, requests were throttled instantly with 100%
              precision.
            </p>
            <div className="flex max-w-sm flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between border-b py-1">
                <span>Accepted Requests (200 OK)</span>
                <span className="font-bold text-emerald-600">200</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>Throttled Requests (429 Rate Limited)</span>
                <span className="font-bold text-amber-600">30,443</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Contains Retry-After Header</span>
                <span className="font-bold text-foreground">100% Yes</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-background p-5 font-mono text-[10px] leading-relaxed text-foreground/80 shadow-sm md:col-span-6">
            <div className="mb-2 flex justify-between border-b pb-2 font-bold text-red-500">
              <span>HTTP/1.1 429 Too Many Requests</span>
              <span>Rate Limit Exceeded</span>
            </div>
            <pre>
              {`cache-control: no-cache
content-type: application/json
retry-after: 58

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit of 200 requests per minute exceeded.",
    "retryAfterSeconds": 58
  }
}`}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}
