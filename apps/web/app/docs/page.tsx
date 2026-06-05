"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cpu, 
  Graph, 
  Folder, 
  CheckSquare, 
  Play, 
  Sliders, 
  Code, 
  GitMerge, 
  ArrowClockwise, 
  Lightning, 
  Gauge, 
  Flame, 
  Stack, 
  FileText,
  Copy,
  Check,
  House
} from "@phosphor-icons/react";

// Sidebar navigation structure mapping README sections
const docSections = [
  { id: "architecture", title: "Architecture", icon: Cpu },
  { id: "benchmarks", title: "Performance Benchmarks", icon: Graph },
  { id: "structure", title: "Project Structure", icon: Folder },
  { id: "prerequisites", title: "Prerequisites", icon: CheckSquare },
  { id: "getting-started", title: "Getting Started", icon: Play },
  { id: "configuration", title: "Configuration", icon: Sliders },
  { id: "api-reference", title: "API Reference", icon: Code },
  { id: "pipeline", title: "Delivery Pipeline", icon: GitMerge },
  { id: "retry-strategy", title: "Retry Strategy", icon: ArrowClockwise },
  { id: "circuit-breaker", title: "Circuit Breaker", icon: Lightning },
  { id: "rate-limiting", title: "Rate Limiting", icon: Gauge },
  { id: "load-testing", title: "Load Testing", icon: Flame },
  { id: "tech-stack", title: "Tech Stack", icon: Stack },
  { id: "license", title: "License", icon: FileText }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("architecture");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Scroll spy to highlight active section in sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of docSections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
        
        {/* Left Sticky Sidebar */}
        <Sidebar className="hidden md:flex border-r border-border bg-card w-64 fixed top-16 bottom-0 z-30">
          <SidebarContent className="py-6">
            <SidebarGroup>
              <div className="px-3 mb-6">
                <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition-colors">
                  <House className="size-4" />
                  Back to Home
                </Link>
                <div className="mt-4 text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                  Documentation
                </div>
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {docSections.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                          onClick={() => handleScrollTo(item.id)}
                          isActive={activeSection === item.id}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                            activeSection === item.id 
                              ? "bg-blue-600 text-white hover:bg-blue-700" 
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Right Scrollable Content Pane */}
        <div className="flex-1 md:pl-64 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-24 md:py-32 flex flex-col gap-20">
            
            {/* Header Introduction */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
                HookRelay Documentation
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Welcome to the complete developer reference guide for HookRelay. Learn how to configure, deploy, scale, and integrate our reliable high-throughput webhook delivery infrastructure.
              </p>
              <Separator className="mt-8" />
            </div>

            {/* Section: Architecture */}
            <section id="architecture" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Cpu className="size-6 text-blue-600" />
                Architecture
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                HookRelay accepts events from producers via a REST API, buffers them in Redis, and guarantees delivery to endpoints through BullMQ workers. The architecture supports horizontal scaling and automatic recovery.
              </p>
              
              {/* Architecture text chart in clean box */}
              <div className="border border-border rounded-xl bg-muted/30 p-5 font-mono text-[10px] leading-relaxed text-foreground/80 overflow-x-auto mb-6 shadow-sm">
{`                           ┌─────────────┐
                           │  Producers  │
                           └──────┬──────┘
                                  │  POST /events
                                  ▼
                        ┌───────────────────┐
                        │   API (Fastify)   │
                        │                   │
                        │  ┌─────────────┐  │
                        │  │ Tenant Auth  │◄─┼── Redis (cached)
                        │  │ Rate Limiter │◄─┼── Redis (Lua INCR)
                        │  │ Idempotency  │◄─┼── Redis (GET)
                        │  └──────┬──────┘  │
                        │         │ LPUSH   │
                        └─────────┼─────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                        │   Redis Buffer    │
                        │  (ingest list)    │
                        └────────┬──────────┘
                                 │ RPOP (batches of 100)
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Worker Process                           │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  Ingest Worker   │  │  Fanout Worker   │  │  DLQ Worker    │  │
│  │                  │  │                  │  │                │  │
│  │ Batch INSERT     │  │ Resolve          │  │ Move dead      │  │
│  │ into Postgres    │──▶ endpoints        │  │ deliveries     │  │
│  │ Bulk enqueue     │  │ Create delivery  │  │                │  │
│  │ fanout jobs      │  │ rows + jobs      │  └────────────────┘  │
│  │                  │  └───────┬──────────┘                      │
│  └─────────────────┘          │                                  │
│                    ┌──────────▼──────────┐                       │
│                    │  Delivery Workers   │                       │
│                    │  (per tenant)       │                       │
│                    │                     │                       │
│                    │ Circuit breaker     │                       │
│                    │ HMAC-SHA256 signing │                       │
│                    │ HTTP delivery       │                       │
│                    │ Retry scheduling    │                       │
│                    └──────────┬──────────┘                       │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Consumer Endpoints   │
                    └───────────────────────┘`}
              </div>

              <h3 className="text-sm font-bold text-foreground mb-3 font-mono">Data Flow</h3>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground flex flex-col gap-2 mb-6">
                <li>Producers submit events to the gateway via <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">POST /events</code>.</li>
                <li>The API authenticates, rate-limits, checks idempotency, and stores the event in a Redis queue, responding immediately.</li>
                <li>The <strong>Ingest Worker</strong> processes queue batches, performing bulk SQL inserts to PostgreSQL and BullMQ.</li>
                <li>The <strong>Fanout Worker</strong> resolves endpoint filters and schedules delivery jobs.</li>
                <li><strong>Delivery Workers</strong> sign requests using HMAC-SHA256 and execute delivery calls, respecting circuit breakers.</li>
              </ol>

              <h3 className="text-sm font-bold text-foreground mb-3 font-mono">Database Schema</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TABLE</TableHead>
                    <TableHead>PURPOSE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-muted-foreground text-xs">
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">tenants</TableCell>
                    <TableCell>Multi-tenant account credentials, API hashes, and rate limit definitions.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">endpoints</TableCell>
                    <TableCell>Registered webhook target URLs with signing secrets, filters, and status flags.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">events</TableCell>
                    <TableCell>Payload backups, event types, and idempotency key references.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">deliveries</TableCell>
                    <TableCell>Delivery records mapping events to endpoints and scheduling retry timings.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">delivery_attempts</TableCell>
                    <TableCell>Audit log logs tracking HTTP response statuses, raw error messages, and latency profiles.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            {/* Section: Performance Benchmarks */}
            <section id="benchmarks" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Graph className="size-6 text-indigo-600" />
                Performance Benchmarks
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                HookRelay is benchmarked using k6 on a local Docker framework. Ingestion throughput processes over **1,259 requests per second** concurrently.
              </p>

              <h3 className="text-sm font-bold text-foreground mb-3 font-mono">Throughput Profile</h3>
              <Table className="mb-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>METRIC</TableHead>
                    <TableHead>VALUE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-muted-foreground text-xs font-mono">
                  <TableRow>
                    <TableCell className="font-sans">Throughput</TableCell>
                    <TableCell className="font-bold text-foreground">1,259 req/s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-sans">p50 Latency</TableCell>
                    <TableCell className="font-bold text-foreground">73 ms</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-sans">p95 Latency</TableCell>
                    <TableCell className="font-bold text-foreground">166 ms</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-sans">Error Rate (&gt;500ms)</TableCell>
                    <TableCell className="font-bold text-foreground">0.12%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-sans">HTTP failure rate</TableCell>
                    <TableCell className="font-bold text-foreground">0.00%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h3 className="text-sm font-bold text-foreground mb-3 font-mono">Optimization History</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CHANGE STAGE</TableHead>
                    <TableHead>p50</TableHead>
                    <TableHead>p95</TableHead>
                    <TableHead>THROUGHPUT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-muted-foreground text-xs font-mono">
                  <TableRow>
                    <TableCell className="font-sans font-semibold">Baseline Node API</TableCell>
                    <TableCell>247 ms</TableCell>
                    <TableCell>709 ms</TableCell>
                    <TableCell>342 req/s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-sans font-semibold">Fastify Schemas & Pino Logging</TableCell>
                    <TableCell>190 ms</TableCell>
                    <TableCell>444 ms</TableCell>
                    <TableCell>455 req/s</TableCell>
                  </TableRow>
                  <TableRow className="text-emerald-500 font-semibold bg-emerald-500/5">
                    <TableCell className="font-sans font-bold">Redis Buffer + Batch SQL Inserts</TableCell>
                    <TableCell>73 ms</TableCell>
                    <TableCell>166 ms</TableCell>
                    <TableCell>1,259 req/s</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            {/* Section: Project Structure */}
            <section id="structure" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Folder className="size-6 text-blue-600" />
                Project Structure
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                HookRelay is organized as a pnpm workspace monorepo divided into applications (`apps`) and packages (`packages`).
              </p>
              
              <div className="border border-border rounded-xl bg-muted/30 p-5 font-mono text-[10px] leading-relaxed text-foreground/80 overflow-x-auto shadow-sm">
{`hookrelay/
├── apps/
│   ├── api/                    # Fastify HTTP server ingestion gateway
│   │   └── src/
│   │       ├── main.ts         # Server entry point
│   │       ├── routes/         # REST API routes (events, tenants, endpoints)
│   │       └── middleware/     # Rate limiter & auth filters
│   ├── worker/                 # Background job worker orchestrators
│   │   └── src/
│   │       └── workers/        # BullMQ worker processors (ingest, fanout, delivery, dlq)
│   └── mock-server/            # Webhook consumer mock server
├── packages/
│   ├── db/                     # Drizzle ORM schema, push migrations, queries
│   ├── queue/                  # BullMQ definitions, Redis connection clients
│   ├── services/               # Ingest, fanout, circuit-breakers, signature validators
│   └── typescript-config/      # Workspace shared typescript settings
└── docker-compose.yml          # Container configuration`}
              </div>
            </section>

            {/* Section: Prerequisites */}
            <section id="prerequisites" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <CheckSquare className="size-6 text-indigo-600" />
                Prerequisites
              </h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground flex flex-col gap-2.5">
                <li><strong>Node.js</strong>: version 18 or higher.</li>
                <li><strong>pnpm</strong>: version 9.0 or higher.</li>
                <li><strong>Docker / Docker Compose</strong>: for running database containers.</li>
                <li><strong>PostgreSQL 16</strong> and <strong>Redis 7</strong>.</li>
              </ul>
            </section>

            {/* Section: Getting Started */}
            <section id="getting-started" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Play className="size-6 text-blue-600" />
                Getting Started
              </h2>
              
              <h3 className="text-sm font-bold text-foreground mb-3 font-mono">Running with Docker (Recommended)</h3>
              <div className="border border-border rounded-lg bg-muted/40 p-4 font-mono text-xs text-foreground/80 relative overflow-hidden mb-6">
                <button 
                  onClick={() => handleCopy("docker compose up -d", "docker")}
                  className="absolute top-2.5 right-2.5 p-1 rounded border border-border bg-background hover:bg-muted text-muted-foreground"
                >
                  {copiedText === "docker" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                </button>
                <pre>{`# 1. Clone repository
git clone https://github.com/SoloDevAbu/HookRelay.git
cd HookRelay

# 2. Copy env configs
cp .env.example .env

# 3. Spin up environment containers
docker compose up -d`}</pre>
              </div>

              <h3 className="text-sm font-bold text-foreground mb-3 font-mono">Running without Docker</h3>
              <div className="border border-border rounded-lg bg-muted/40 p-4 font-mono text-xs text-foreground/80 relative overflow-hidden">
                <button 
                  onClick={() => handleCopy("pnpm install && pnpm build", "nodocker")}
                  className="absolute top-2.5 right-2.5 p-1 rounded border border-border bg-background hover:bg-muted text-muted-foreground"
                >
                  {copiedText === "nodocker" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                </button>
                <pre>{`# Install workspace dependencies
pnpm install

# Run database push migrations
pnpm --filter @hookrelay/db db:push

# Launch API and Worker tasks
pnpm --filter @hookrelay/api dev
pnpm --filter @hookrelay/worker dev`}</pre>
              </div>
            </section>

            {/* Section: Configuration */}
            <section id="configuration" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Sliders className="size-6 text-indigo-600" />
                Configuration Settings
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Settings are validated at startup using Zod schemas. Configure these using `.env` file variables.
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VARIABLE</TableHead>
                    <TableHead>DESCRIPTION</TableHead>
                    <TableHead>DEFAULT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-muted-foreground text-xs">
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">DATABASE_URL</TableCell>
                    <TableCell>PostgreSQL credentials string.</TableCell>
                    <TableCell className="italic text-red-400">Required</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">REDIS_URL</TableCell>
                    <TableCell>Redis host and port url.</TableCell>
                    <TableCell className="italic text-red-400">Required</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">ADMIN_SECRET</TableCell>
                    <TableCell>Access token for managing retries and DLQ.</TableCell>
                    <TableCell className="italic text-red-400">Required</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">MAX_DELIVERY_ATTEMPTS</TableCell>
                    <TableCell>Total HTTP delivery retries before moving to DLQ.</TableCell>
                    <TableCell className="font-mono">10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-foreground">CIRCUIT_BREAKER_THRESHOLD</TableCell>
                    <TableCell>Consecutive client failures before opening circuit.</TableCell>
                    <TableCell className="font-mono">5</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            {/* Section: API Reference */}
            <section id="api-reference" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Code className="size-6 text-blue-600" />
                API Reference
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                All client endpoints require client authorization header key: <code className="font-mono bg-muted text-foreground px-1 py-0.5 rounded">X-Api-Key</code>. Admin tasks require: <code className="font-mono bg-muted text-foreground px-1 py-0.5 rounded">X-Admin-Key</code>.
              </p>

              {/* Endpoint Card: POST /tenants */}
              <div className="flex flex-col gap-6">
                <Card className="border border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 rounded">POST</span>
                        <span className="font-mono text-sm font-semibold text-foreground">/tenants</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Admin Access Only</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Registers a new client tenant workspace. Returns the raw API credential key.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Request */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">CURL COMMAND</span>
                        <div className="border rounded bg-muted/30 p-3 font-mono text-[9px] text-foreground/80 relative">
                          <pre className="whitespace-pre-wrap select-all">{`curl -X POST http://localhost:3000/tenants \\
  -H "X-Admin-Key: <secret>" \\
  -d '{"name": "production-app"}'`}</pre>
                        </div>
                      </div>
                      {/* Response */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">JSON RESPONSE (201)</span>
                        <div className="border rounded bg-muted/30 p-3 font-mono text-[9px] text-foreground/80">
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
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 rounded">POST</span>
                        <span className="font-mono text-sm font-semibold text-foreground">/events</span>
                      </div>
                      <span className="text-xs text-muted-foreground">X-Api-Key Required</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Ingests a new webhook payload. Loops to buffer queue and returns 202 accepted.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Request */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">CURL COMMAND</span>
                        <div className="border rounded bg-muted/30 p-3 font-mono text-[9px] text-foreground/80">
                          <pre className="whitespace-pre-wrap select-all">{`curl -X POST http://localhost:3000/events \\
  -H "X-Api-Key: hr_key_..." \\
  -d '{
    "eventType": "order.placed",
    "payload": {"id": 12},
    "idempotencyKey": "order-12"
  }'`}</pre>
                        </div>
                      </div>
                      {/* Response */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">JSON RESPONSE (202)</span>
                        <div className="border rounded bg-muted/30 p-3 font-mono text-[9px] text-foreground/80">
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

            {/* Section: Pipeline */}
            <section id="pipeline" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <GitMerge className="size-6 text-indigo-600" />
                Delivery Pipeline
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Webhooks pass through a fast and reliable pipeline to isolate failures and guarantee payload delivery.
              </p>
              <div className="border rounded-lg bg-muted/40 p-4 font-mono text-xs text-center text-blue-600 font-bold mb-6">
                Event Ingested &rarr; Redis Buffer &rarr; Batch SQL &rarr; Fanout worker &rarr; Per-Tenant Worker Queue &rarr; Client Endpoint
              </div>
              <ul className="list-disc pl-5 text-sm text-muted-foreground flex flex-col gap-3">
                <li><strong>Redis Buffering</strong>: Ingested events sit in memory. Your servers don't lock database connections.</li>
                <li><strong>Batch Worker Ingestion</strong>: Event logs are batch flushed to Postgres in blocks of 100 to reduce database connection bottlenecks.</li>
                <li><strong>Tenant Isolation</strong>: bullmq handles delivery tasks. Every tenant has a separate concurrent worker queue, preventing one slow customer destination from throttling the rest of the network.</li>
              </ul>
            </section>

            {/* Section: Retry Strategy */}
            <section id="retry-strategy" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <ArrowClockwise className="size-6 text-blue-600" />
                Retry Strategy
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Failed delivery calls (such as network timeout, 404, or 500 status codes) automatically retry using a fixed exponential backoff table.
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ATTEMPT</TableHead>
                    <TableHead>BACKOFF DELAY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-muted-foreground text-xs font-mono">
                  <TableRow><TableCell>Attempt 1</TableCell><TableCell>10 Seconds</TableCell></TableRow>
                  <TableRow><TableCell>Attempt 2</TableCell><TableCell>30 Seconds</TableCell></TableRow>
                  <TableRow><TableCell>Attempt 3</TableCell><TableCell>1 Minute</TableCell></TableRow>
                  <TableRow><TableCell>Attempt 4</TableCell><TableCell>5 Minutes</TableCell></TableRow>
                  <TableRow><TableCell>Attempt 5</TableCell><TableCell>30 Minutes</TableCell></TableRow>
                  <TableRow><TableCell>Attempt 9</TableCell><TableCell>12 Hours</TableCell></TableRow>
                  <TableRow><TableCell>Attempt 10 (Final)</TableCell><TableCell>24 Hours</TableCell></TableRow>
                </TableBody>
              </Table>
            </section>

            {/* Section: Circuit Breaker */}
            <section id="circuit-breaker" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Lightning className="size-6 text-indigo-600" />
                Circuit Breaker
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Each destination endpoint operates under an isolated Redis-backed circuit breaker state machine:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground flex flex-col gap-3">
                <li><strong>CLOSED</strong>: Normal status. Deliveries run freely.</li>
                <li><strong>OPEN</strong>: Triggered after 5 consecutive endpoint errors. Deliveries bypass the destination and auto-schedule for delayed retry, avoiding server exhaustion.</li>
                <li><strong>HALF-OPEN</strong>: After a 60-second cooldown, one probe request executes. If it returns 2xx, the circuit closes. If it fails, the circuit re-opens.</li>
              </ul>
            </section>

            {/* Section: Rate Limiting */}
            <section id="rate-limiting" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Gauge className="size-6 text-blue-600" />
                Rate Limiting
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Rate limiting is active per-tenant using Redis counters. If a workspace exceeds its rate limits (e.g. 1,000 req/min), HookRelay returns a 429 response block containing a standard <code className="font-mono bg-muted text-foreground px-1 py-0.5 rounded text-xs">Retry-After</code> header specifying when ingestion re-opens.
              </p>
            </section>

            {/* Section: Load Testing */}
            <section id="load-testing" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <Flame className="size-6 text-indigo-600" />
                Load Testing
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                k6 test configurations exist inside the project repository root for auditing local deployments:
              </p>
              <div className="border border-border rounded-lg bg-muted/40 p-4 font-mono text-xs text-foreground/80 relative overflow-hidden">
                <button 
                  onClick={() => handleCopy("k6 run k6/load-test.js", "k6cmd")}
                  className="absolute top-2.5 right-2.5 p-1 rounded border border-border bg-background hover:bg-muted text-muted-foreground"
                >
                  {copiedText === "k6cmd" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                </button>
                <pre>{`# Run full ingestion load test (200 VUs, 5 minutes)
k6 run k6/load-test.js

# Validate rate limiting response headers
k6 run k6/rate-limit-test.js`}</pre>
              </div>
            </section>

            {/* Section: Tech Stack */}
            <section id="tech-stack" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
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
                <TableBody className="text-muted-foreground text-xs">
                  <TableRow><TableCell className="font-semibold text-foreground">Language runtime</TableCell><TableCell>TypeScript (Node.js &gt;= 18)</TableCell></TableRow>
                  <TableRow><TableCell className="font-semibold text-foreground">API gateway framework</TableCell><TableCell>Fastify 5 (High-speed schema validations)</TableCell></TableRow>
                  <TableRow><TableCell className="font-semibold text-foreground">Background queues</TableCell><TableCell>BullMQ (Bull Redis queues)</TableCell></TableRow>
                  <TableRow><TableCell className="font-semibold text-foreground">Relational database</TableCell><TableCell>PostgreSQL 16</TableCell></TableRow>
                  <TableRow><TableCell className="font-semibold text-foreground">Database ORM mapping</TableCell><TableCell>Drizzle ORM</TableCell></TableRow>
                  <TableRow><TableCell className="font-semibold text-foreground">Caching & rate metrics</TableCell><TableCell>Redis 7 (Lua atomic scripts)</TableCell></TableRow>
                </TableBody>
              </Table>
            </section>

            {/* Section: License */}
            <section id="license" className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
                <FileText className="size-6 text-indigo-600" />
                License
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                HookRelay is open-source software licensed under the **MIT License**. Feel free to use, audit, and distribute in your projects.
              </p>
            </section>

          </div>
        </div>

      </div>
    </SidebarProvider>
  );
}
