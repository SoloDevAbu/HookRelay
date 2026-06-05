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
  Circle
} from "@phosphor-icons/react";

export function FeatureDelivery() {
  const [copied, setCopied] = useState(false);
  const [activeEvent, setActiveEvent] = useState<"created" | "updated">("created");
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
    <section className="w-full py-20 px-4 max-w-7xl mx-auto border-t border-border/50 bg-muted/10">
      {/* Event Gateway Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        {/* Diagram Column (Left) */}
        <div className="lg:col-span-7 bg-muted/30 border rounded-2xl p-8 relative overflow-hidden flex items-center justify-center min-h-[340px] order-2 lg:order-1">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:10px_10px]" />
          
          {/* SVG Animated Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            {/* Input to Hub */}
            <path d="M 80 160 H 250" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500/20" />
            <path d="M 80 160 H 250" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 20" className="animate-dash" />

            {/* Hub to Webhooks */}
            <path d="M 290 160 Q 380 150 480 70" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500/20" />
            <path d="M 290 160 Q 380 150 480 70" fill="none" stroke={hoveredNode === "webhooks" ? "#10b981" : "#94a3b8"} strokeWidth={hoveredNode === "webhooks" ? "3" : "2"} strokeDasharray="6 20" className="animate-dash" />

            {/* Hub to SQS */}
            <path d="M 290 160 H 480" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500/20" />
            <path d="M 290 160 H 480" fill="none" stroke={hoveredNode === "sqs" ? "#f59e0b" : "#94a3b8"} strokeWidth={hoveredNode === "sqs" ? "3" : "2"} strokeDasharray="6 20" className="animate-dash" />

            {/* Hub to DB */}
            <path d="M 290 160 Q 380 170 480 250" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500/20" />
            <path d="M 290 160 Q 380 170 480 250" fill="none" stroke={hoveredNode === "db" ? "#a855f7" : "#94a3b8"} strokeWidth={hoveredNode === "db" ? "3" : "2"} strokeDasharray="6 20" className="animate-dash" />
          </svg>

          {/* Node Grid Layout */}
          <div className="w-full flex items-center justify-between relative z-10 max-w-xl">
            {/* Input Trigger */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 px-4 py-2 bg-background border rounded-full shadow-sm">
                <div className="p-1 rounded bg-blue-500/10 text-blue-600 animate-pulse">
                  <Terminal className="size-4" />
                </div>
                <span className="text-xs font-semibold font-mono tracking-tight text-foreground">API PLATFORM</span>
              </div>
            </div>

            {/* Central HookRelay Hub */}
            <div className="relative">
              <div className="size-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white ring-8 ring-blue-600/5">
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 -z-10" />
            </div>

            {/* Outbound Destinations */}
            <div className="flex flex-col gap-6">
              {/* Webhooks */}
              <div 
                onMouseEnter={() => setHoveredNode("webhooks")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`flex items-center gap-3 px-4 py-2 bg-background border rounded-full shadow-sm transition-all duration-200 cursor-pointer ${
                  hoveredNode === "webhooks" ? "border-emerald-500 scale-105" : ""
                }`}
              >
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                  <Globe className="size-4" />
                </div>
                <span className="text-xs font-semibold font-mono tracking-tight text-foreground">WEBHOOKS</span>
              </div>
              
              {/* AWS SQS */}
              <div 
                onMouseEnter={() => setHoveredNode("sqs")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`flex items-center gap-3 px-4 py-2 bg-background border rounded-full shadow-sm transition-all duration-200 cursor-pointer ${
                  hoveredNode === "sqs" ? "border-amber-500 scale-105" : ""
                }`}
              >
                <div className="p-1 rounded bg-amber-500/10 text-amber-600">
                  <Gear className="size-4" />
                </div>
                <span className="text-xs font-semibold font-mono tracking-tight text-foreground">AWS SQS</span>
              </div>
              
              {/* Database Storage */}
              <div 
                onMouseEnter={() => setHoveredNode("db")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`flex items-center gap-3 px-4 py-2 bg-background border rounded-full shadow-sm transition-all duration-200 cursor-pointer ${
                  hoveredNode === "db" ? "border-purple-500 scale-105" : ""
                }`}
              >
                <div className="p-1 rounded bg-purple-500/10 text-purple-600">
                  <Database className="size-4" />
                </div>
                <span className="text-xs font-semibold font-mono tracking-tight text-foreground">HOOKRELAY DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text Column (Right) */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left order-1 lg:order-2">
          <div className="text-xs font-mono font-bold tracking-widest text-indigo-600 uppercase mb-2">
            Send Webhooks
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Outpost Dispatcher
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Deliver webhook alerts seamlessly. Manage subscriber routing patterns, verify deliveries, configure authentication payloads, and monitor success statistics easily.
          </p>
          <div className="flex gap-4">
            <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/10">
              Configure Outpost
            </Button>
            <Button variant="outline" className="rounded-full">
              Explore Destinations
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: Subscription API */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="size-5 text-blue-600" />
              <h3 className="font-bold text-base">Register Endpoint Subscriptions</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Create and manage consumer endpoints dynamically via HTTP requests. Protect connections with shared secrets.
            </p>
          </div>
          <div className="px-6 pb-6 mt-auto">
            {/* Command Widget */}
            <div className="border border-border/80 rounded-lg bg-muted/40 p-4 font-mono text-[10px] overflow-hidden leading-relaxed text-foreground/80 relative">
              <button 
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Copy Curl Command"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              </button>
              <pre className="text-foreground/90 whitespace-pre-wrap select-all">
                {curlCommand}
              </pre>
            </div>
          </div>
        </Card>

        {/* Card 2: Publish Routing */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PaperPlane className="size-5 text-indigo-600" />
              <h3 className="font-bold text-base">Filter Destination Events</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Selectively trigger endpoints by defining filters. Consumers will only capture events matching their filter array.
            </p>
          </div>
          <div className="px-6 pb-6 mt-auto">
            {/* Event selection simulator */}
            <div className="border border-border/80 rounded-lg bg-muted/40 p-4 flex flex-col gap-3">
              <span className="text-xs font-mono font-semibold text-muted-foreground">EVENT SOURCE TRIGGERS</span>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveEvent("created")}
                  className={`px-3 py-1.5 font-mono text-[11px] rounded border transition-colors ${
                    activeEvent === "created" 
                      ? "bg-indigo-600 text-white border-indigo-600" 
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  order.created
                </button>
                
                <button 
                  onClick={() => setActiveEvent("updated")}
                  className={`px-3 py-1.5 font-mono text-[11px] rounded border transition-colors ${
                    activeEvent === "updated" 
                      ? "bg-indigo-600 text-white border-indigo-600" 
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  order.updated
                </button>
              </div>

              <div className="text-[11px] text-muted-foreground font-mono bg-background/50 border rounded p-2.5">
                {activeEvent === "created" ? (
                  <span className="text-emerald-500 flex items-center gap-1.5">
                    <Circle weight="fill" className="size-2 animate-ping" />
                    Delivering order.created event to WEBHOOKS & AWS SQS
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1.5">
                    <Circle weight="fill" className="size-2 animate-ping" />
                    Delivering order.updated event to WEBHOOKS & DATABASE
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Debug Portal */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="size-5 text-emerald-600" />
              <h3 className="font-bold text-base">Consumer Debugging Dashboard</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Offer your customers a dedicated portal to view logs, trace payloads, inspect retry headers, and verify delivery success metrics.
            </p>
          </div>
          <div className="px-6 pb-6 mt-auto">
            {/* Mini Portal Logs Grid */}
            <div className="border border-border/80 rounded-lg bg-muted/40 p-3 font-mono text-[10px] flex flex-col gap-2">
              <div className="border-b border-border/60 pb-1.5 font-semibold text-muted-foreground flex justify-between">
                <span>DESTINATION</span>
                <span>SUCCESS</span>
                <span>LATENCY</span>
              </div>
              <div className="flex justify-between items-center text-foreground/80">
                <span className="text-blue-600 font-medium">https://api.client...</span>
                <span className="text-emerald-500 font-bold">99.9%</span>
                <span>124ms</span>
              </div>
              <div className="flex justify-between items-center text-foreground/80">
                <span className="text-amber-600 font-medium">AWS SQS Target</span>
                <span className="text-emerald-500 font-bold">100.0%</span>
                <span>12ms</span>
              </div>
              <div className="flex justify-between items-center text-foreground/80">
                <span className="text-purple-600 font-medium">Internal Storage</span>
                <span className="text-emerald-500 font-bold">100.0%</span>
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
