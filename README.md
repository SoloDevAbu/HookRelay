# HookRelay

Reliable, high-throughput webhook delivery infrastructure. Built with Node.js, TypeScript, Fastify, BullMQ, PostgreSQL, and Redis.

HookRelay accepts events from producers via a REST API, fans them out to registered endpoints, and guarantees delivery through automatic retries with exponential backoff, circuit breakers, and dead letter queues. It is multi-tenant, horizontally scalable, and designed to handle thousands of deliveries per second.

## Table of Contents

- [Architecture](#architecture)
- [Performance Benchmarks](#performance-benchmarks)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Running with Docker (recommended)](#running-with-docker-recommended)
  - [Running without Docker](#running-without-docker)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Delivery Pipeline](#delivery-pipeline)
- [Retry Strategy](#retry-strategy)
- [Circuit Breaker](#circuit-breaker)
- [Rate Limiting](#rate-limiting)
- [Load Testing](#load-testing)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Architecture

```
                           ┌─────────────┐
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
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  Ingest Worker   │  │  Fanout Worker   │  │  DLQ Worker    │  │
│  │                  │  │                  │  │                │  │
│  │ Batch INSERT     │  │ Resolve          │  │ Move dead      │  │
│  │ into Postgres    │──▶ endpoints        │  │ deliveries     │  │
│  │ Bulk enqueue     │  │ Create delivery  │  │                │  │
│  │ fanout jobs      │  │ rows + jobs      │  └────────────────┘  │
│  └─────────────────┘  └───────┬──────────┘                      │
│                               │                                  │
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
                    └───────────────────────┘
```

### Data flow

1. A producer sends an event to `POST /events` with an API key.
2. The API authenticates the tenant (Redis-cached), applies rate limiting (Lua-based fixed-window counter), checks idempotency (Redis), and pushes the event to a Redis buffer list. The HTTP response returns immediately.
3. The **Ingest Worker** drains the buffer in batches. Each batch is inserted into PostgreSQL in a single query, and fanout jobs are enqueued in bulk via BullMQ.
4. The **Fanout Worker** resolves the tenant's active endpoints (with event type filtering), creates delivery records, and enqueues per-tenant delivery jobs.
5. **Delivery Workers** (one queue per tenant) execute HTTP requests to each endpoint. Every outgoing request is signed with HMAC-SHA256 using the endpoint's secret. The circuit breaker prevents repeated calls to failing endpoints.
6. Failed deliveries are retried with exponential backoff. After exhausting all attempts, the delivery is moved to a dead letter queue.

### Database schema

| Table | Purpose |
|-------|---------|
| `tenants` | Multi-tenant accounts with API key hashes and rate limits |
| `endpoints` | Registered webhook URLs per tenant with secrets, filters, and status |
| `events` | Ingested events with payloads and idempotency keys |
| `deliveries` | One row per event-endpoint pair tracking status and retry state |
| `delivery_attempts` | Audit log of every HTTP call made, including status codes and latency |

---

## Performance Benchmarks

Tested with [k6](https://k6.io/) on a single machine running Docker Desktop. 200 virtual users ramping over 5 minutes against `POST /events`.

### Ingestion throughput

| Metric | Value |
|--------|-------|
| Throughput | **1,259 req/s** |
| Total requests (5 min) | **377,843** |
| p50 latency | **73 ms** |
| p90 latency | **141 ms** |
| p95 latency | **166 ms** |
| p99 latency | **~400 ms** |
| Max latency | **1,010 ms** |
| Error rate (>500ms) | **0.12%** |
| HTTP failure rate | **0.00%** |

### Optimization history

| Change | p50 | p95 | Error rate | Throughput |
|--------|-----|-----|------------|------------|
| Baseline | 247 ms | 709 ms | 22.71% | 342 req/s |
| + Connection pool tuning (10 → 50) | — | — | — | — |
| + Tenant auth Redis cache (60s TTL) | — | — | — | — |
| + Lua atomic rate limiter | — | — | — | — |
| + Async fire-and-forget ingestion | — | — | — | — |
| + Fastify response schema | — | — | — | — |
| + Reduced hot-path logging | 190 ms | 444 ms | 2.97% | 455 req/s |
| + Redis buffer + batch DB insert | **73 ms** | **166 ms** | **0.12%** | **1,259 req/s** |

### Rate limiting

Tested with 50 VUs over 30 seconds against a tenant with a 200 req/min limit:

| Metric | Value |
|--------|-------|
| Accepted (200) | 200 |
| Rate limited (429) | 30,443 |
| All 429 responses include `Retry-After` header | Yes |

---

## Project Structure

```
hookrelay/
├── apps/
│   ├── api/                    # Fastify HTTP server
│   │   └── src/
│   │       ├── main.ts         # Entry point
│   │       ├── server.ts       # Fastify instance and route registration
│   │       ├── middleware/
│   │       │   ├── auth.ts     # Tenant API key auth with Redis cache
│   │       │   ├── rate-limit.ts   # Lua-based fixed-window rate limiter
│   │       │   └── error-handler.ts
│   │       ├── routes/
│   │       │   ├── event.routes.ts     # POST /events
│   │       │   ├── tenant.routes.ts    # POST /tenants
│   │       │   ├── endpoint.routes.ts  # CRUD /endpoints
│   │       │   ├── deliveries.routes.ts # GET /deliveries
│   │       │   └── admin.routes.ts     # Admin retry/replay/reset
│   │       └── lib/
│   │           ├── crypto.ts   # API key hashing
│   │           └── response.ts # Standardized response helpers
│   ├── worker/                 # Background job processors
│   │   └── src/
│   │       ├── main.ts         # Worker orchestrator and shutdown handler
│   │       └── workers/
│   │           ├── ingest.worker.ts    # Redis buffer → batch Postgres + fanout
│   │           ├── fanout.worker.ts    # Event → endpoint resolution → delivery jobs
│   │           ├── delivery.worker.ts  # HTTP delivery with circuit breaker
│   │           └── dlq.worker.ts       # Dead letter queue processing
│   └── mock-server/            # Test target for local development
├── packages/
│   ├── config/                 # Zod-validated environment configuration
│   ├── db/                     # PostgreSQL schema, migrations, and queries (Drizzle ORM)
│   ├── lib/                    # Redis client, logger (pino), HTTP client (undici)
│   ├── queue/                  # BullMQ queue definitions and Redis connections
│   ├── services/               # Core business logic
│   │   ├── ingest.service.ts       # Event ingestion and Redis buffering
│   │   ├── fanout.service.ts       # Endpoint resolution and delivery creation
│   │   ├── delivery.service.ts     # HTTP execution and attempt recording
│   │   ├── retry.service.ts        # Backoff schedule and DLQ decisions
│   │   ├── signature.service.ts    # HMAC-SHA256 payload signing
│   │   ├── curcuit-breaker.service.ts  # Redis-backed circuit breaker (Lua scripts)
│   │   └── observability.service.ts    # Metrics and health queries
│   └── typescript-config/      # Shared tsconfig
├── k6/                         # Load test scripts
├── docker/
│   ├── Dockerfile.api
│   └── Dockerfile.worker
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

The project is a [Turborepo](https://turbo.build/repo) monorepo using [pnpm](https://pnpm.io/) workspaces.

---

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9.0 (the repo uses corepack; run `corepack enable`)
- **Docker** and **Docker Compose** (for containerized setup)
- **PostgreSQL** 16 (if running without Docker)
- **Redis** 7 (if running without Docker)

---

## Getting Started

### Running with Docker (recommended)

This runs PostgreSQL, Redis, the API server, the worker, and a mock webhook target in containers.

```bash
# Clone the repository
git clone https://github.com/SoloDevAbu/HookRelay.git
cd HookRelay

# Copy the environment file
cp .env.example .env
# Edit .env and set ADMIN_SECRET and SIGNATURE_SECRET (minimum 32 characters each)

# Start all services
docker compose up -d

# Verify
curl http://localhost:3000/health
# {"status":"ok"}

# Run database migrations
pnpm install
pnpm --filter @hookrelay/db db:push
```

The API is available at `http://localhost:3000`. The mock server (webhook target) listens on `http://localhost:4000`.

To scale workers horizontally:

```bash
docker compose up --scale worker=4 -d
```

To rebuild after code changes:

```bash
# Rebuild only the API
docker compose build api --no-cache
docker compose up -d api

# Rebuild only the worker
docker compose build worker --no-cache
docker compose up -d worker

# Rebuild both
docker compose build api worker --no-cache
docker compose up -d
```

### Running without Docker

Requires PostgreSQL and Redis running locally (or accessible via network).

```bash
# Clone and install
git clone https://github.com/SoloDevAbu/HookRelay.git
cd HookRelay
corepack enable
pnpm install

# Copy and configure environment
cp .env.example .env
```

Edit `.env` with your local service URLs:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hookrelay
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
ADMIN_SECRET=your-admin-secret-min-32-characters-long
SIGNATURE_SECRET=your-signature-secret-min-32-characters
```

Create the database and run migrations:

```bash
createdb hookrelay   # or create via psql/pgAdmin
pnpm --filter @hookrelay/db db:push
```

Start the services:

```bash
# Terminal 1: API server
pnpm --filter @hookrelay/api dev

# Terminal 2: Worker process
pnpm --filter @hookrelay/worker dev

# Terminal 3 (optional): Mock webhook target
pnpm --filter @hookrelay/mock-server dev
```

Build for production:

```bash
pnpm build
node apps/api/dist/main.js      # API
node apps/worker/dist/main.js   # Worker
```

---

## Configuration

All configuration is managed through environment variables, validated at startup using [Zod](https://zod.dev/).

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | (required) |
| `REDIS_URL` | Redis connection string | (required) |
| `PORT` | API server port | `3000` |
| `NODE_ENV` | `development`, `production`, or `test` | `development` |
| `ADMIN_SECRET` | Secret for admin API endpoints (min 32 chars) | (required) |
| `MAX_DELIVERY_ATTEMPTS` | Max delivery attempts before DLQ | `10` |
| `DELIVERY_TIMEOUT_MS` | HTTP request timeout per delivery attempt | `30000` |
| `CIRCUIT_BREAKER_THRESHOLD` | Consecutive failures before circuit opens | `5` |
| `CIRCUIT_BREAKER_COOLDOWN_MS` | Time before half-open retry | `60000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window duration | `60000` |

---

## API Reference

All tenant-scoped endpoints require the `X-Api-Key` header. Admin endpoints require the `X-Admin-Key` header.

### Tenants

#### `POST /tenants`

Create a new tenant. Returns the API key (shown only once).

```bash
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "my-service", "rateLimitPerMin": 10000}'
```

```json
{
  "success": true,
  "data": {
    "tenant": { "id": "uuid", "name": "my-service", "createdAt": "..." },
    "apiKey": "hr_abc123...",
    "warning": "Store this API safely. It will never be showing again."
  }
}
```

### Events

#### `POST /events`

Ingest a webhook event. Requires tenant auth and passes rate limiting.

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: hr_abc123..." \
  -d '{
    "eventType": "order.placed",
    "payload": {"orderId": "123", "amount": 4999},
    "idempotencyKey": "order-123-placed"
  }'
```

```json
{
  "success": true,
  "data": {
    "eventId": "uuid",
    "duplicate": false,
    "status": "accepted"
  }
}
```

Response codes:
- `202` — Event accepted for processing
- `200` — Duplicate event (idempotency key matched)
- `429` — Rate limit exceeded (includes `Retry-After` header)

### Endpoints

#### `POST /endpoints`

Register a webhook endpoint. Returns the signing secret (shown only once).

```bash
curl -X POST http://localhost:3000/endpoints \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: hr_abc123..." \
  -d '{
    "url": "https://example.com/webhooks",
    "eventTypeFilter": ["order.placed", "order.cancelled"],
    "customHeaders": {"X-Custom": "value"}
  }'
```

#### `GET /endpoints`

List all endpoints for the authenticated tenant.

#### `PATCH /endpoints/:id`

Update an endpoint's URL, filters, headers, or status (`active`/`paused`).

#### `DELETE /endpoints/:id`

Remove an endpoint.

### Deliveries

#### `GET /deliveries`

List deliveries for the authenticated tenant. Supports filtering and pagination.

```bash
curl "http://localhost:3000/deliveries?status=failed&limit=20&offset=0" \
  -H "X-Api-Key: hr_abc123..."
```

#### `GET /deliveries/:id`

Get a specific delivery by ID.

#### `GET /deliveries/:id/attempts`

Get all HTTP delivery attempts for a specific delivery.

### Admin

All admin endpoints require the `X-Admin-Key` header.

#### `POST /admin/deliveries/:id/retry`

Manually retry a failed or dead delivery.

#### `POST /admin/events/:id/replay`

Re-fanout an event to all endpoints.

#### `POST /admin/endpoints/:id/reset-circuit`

Reset the circuit breaker state for an endpoint.

---

## Delivery Pipeline

Each event follows this lifecycle:

```
Event Ingested → Fanout → Delivery Created → HTTP Attempt → Success / Retry / DLQ
```

1. **Ingestion**: The API validates the request, checks idempotency, and pushes the event into a Redis buffer.
2. **Batch flush**: The Ingest Worker drains the buffer, batch-inserts events into PostgreSQL, and bulk-enqueues fanout jobs.
3. **Fanout**: The Fanout Worker resolves active endpoints for the tenant (respecting `eventTypeFilter`), creates delivery records, and enqueues per-tenant delivery jobs.
4. **Delivery**: Each delivery job makes an HTTP POST to the endpoint URL. The request body is the original event payload. Outgoing requests include:
   - `X-Webhook-Id`: The delivery ID
   - `X-Webhook-Timestamp`: Unix timestamp
   - `X-Webhook-Signature`: HMAC-SHA256 signature (`sha256=<hash>`)
   - Any custom headers configured on the endpoint
5. **Success**: If the endpoint returns 2xx, the delivery is marked `success`.
6. **Retry**: On 4xx/5xx/timeout/network error, the attempt is logged, the delivery's `attemptCount` is incremented, and a retry is scheduled according to the backoff table.
7. **Dead letter**: After `MAX_DELIVERY_ATTEMPTS` (default 10), the delivery moves to `dead` status. Admin can manually retry via `POST /admin/deliveries/:id/retry`.

---

## Retry Strategy

Retries use a fixed backoff schedule:

| Attempt | Delay |
|---------|-------|
| 1 | 10 seconds |
| 2 | 30 seconds |
| 3 | 1 minute |
| 4 | 5 minutes |
| 5 | 30 minutes |
| 6 | 1 hour |
| 7 | 3 hours |
| 8 | 6 hours |
| 9 | 12 hours |
| 10 | 24 hours |

After attempt 10, the delivery is moved to the dead letter queue.

---

## Circuit Breaker

Each endpoint has an independent circuit breaker managed in Redis using Lua scripts for atomicity. States:

- **CLOSED**: Normal operation. Deliveries proceed.
- **OPEN**: Triggered after `CIRCUIT_BREAKER_THRESHOLD` (default 5) consecutive failures. All deliveries to this endpoint are skipped and scheduled for retry after the cooldown period.
- **HALF-OPEN**: After `CIRCUIT_BREAKER_COOLDOWN_MS` (default 60s), one probe request is allowed through. If it succeeds, the circuit closes. If it fails, it reopens.

The circuit breaker prevents wasting resources on endpoints that are clearly down, while automatically recovering when they come back online.

---

## Rate Limiting

Rate limiting is per-tenant, using a fixed-window counter implemented as an atomic Lua script in Redis.

- Each tenant has a configurable `rateLimitPerMin` (default 1,000).
- The counter resets every `RATE_LIMIT_WINDOW_MS` (default 60 seconds).
- Exceeded requests receive HTTP 429 with a `Retry-After` header.

---

## Load Testing

The `k6/` directory contains load test scripts:

```bash
# Ingestion throughput test (200 VUs, 5 minutes)
k6 run k6/load-test.js

# Rate limiting validation (50 VUs, 30 seconds)
k6 run k6/rate-limit-test.js
```

If running against Docker, make sure all containers are up first:

```bash
docker compose up -d
k6 run k6/load-test.js
```

The load test creates a tenant and endpoint during setup, then hammers `POST /events` across 7 stages ramping from 0 to 200 VUs. Pass/fail thresholds:

- `http_req_duration p(95) < 500ms`
- `http_req_duration{name:ingest} p(50) < 100ms`
- `error_rate < 1%`

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript (Node.js >= 18) |
| API framework | Fastify 5 |
| Job queue | BullMQ (Redis-backed) |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Cache / Pub-sub | Redis 7 |
| HTTP client | undici |
| Logging | pino |
| Config validation | Zod |
| Build system | Turborepo + pnpm workspaces |
| Containerization | Docker + Docker Compose |
| Load testing | k6 (Grafana) |

---

## License

MIT
