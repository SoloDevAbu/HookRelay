# 🚀 HookRelay

> Reliable, scalable webhook delivery infrastructure for modern applications.

---

## ✨ Overview

**HookRelay** is a high-performance webhook delivery system designed to handle event ingestion, fan-out, retries, and observability at scale.

Instead of sending webhooks directly, systems send events to HookRelay — which ensures **reliable delivery** to all registered endpoints, even in the presence of failures.

---

## 🧠 Problem

Sending webhooks sounds simple — until it isn't.

* What if the receiver is down?
* What if requests fail intermittently?
* How do you retry without duplicating data?
* How do you track delivery status?

Most systems end up building:

* Retry logic
* Failure handling
* Logging systems
* Delivery tracking

HookRelay solves all of this.

---

## ⚙️ How It Works

```text
Producer → HookRelay → Queue → Workers → Endpoints
```

1. A client sends an event to HookRelay
2. The system validates and stores it
3. It fans out the event to multiple endpoints
4. Delivery jobs are queued
5. Workers process and send HTTP requests
6. Failures are retried with exponential backoff
7. Full logs and delivery status are recorded

---

## Features

* **High-throughput event ingestion**
* **Reliable delivery with retries (exponential backoff)**
* **Fan-out to multiple endpoints**
* **HMAC-SHA256 request signing**
* **Multi-tenant architecture**
* **Idempotency support**
* **Delivery logs & observability**
* **Dead Letter Queue (DLQ) for failed deliveries**
* **Circuit breaker for failing endpoints**
* **Queue-based async processing (BullMQ)**

---

## Architecture

* **API Layer** → Fastify (event ingestion & management)
* **Workers** → Background processors for delivery & retries
* **Queue** → BullMQ (Redis-backed job queue)
* **Database** → PostgreSQL (Drizzle ORM)

---

## 📁 Project Structure

```bash
apps/
  api/        # Fastify HTTP server
  worker/     # Background workers

packages/
  db/         # Database schema & queries (Drizzle)
  queue/      # BullMQ queues
  services/   # Core business logic
  lib/        # Shared utilities
```

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Start all services
docker-compose up

# Run API
pnpm run dev --filter=api

# Run workers
pnpm run dev --filter=worker
```

---

## API Example

### Send Event

```http
POST /events
Authorization: Bearer <API_KEY>
```

```json
{
  "type": "order.created",
  "payload": {
    "orderId": "123",
    "amount": 499
  }
}
```

---

## Retry Strategy

Retries follow exponential backoff:

```text
10s → 30s → 1m → 5m → 30m → 2h → 6h → 12h → 24h
```

After max attempts → moved to **Dead Letter Queue**

---

## Observability

* Delivery logs
* Attempt history
* Success/failure tracking
* Latency metrics

---

## Benchmarks (Coming Soon)

Performance benchmarks will include:

* Requests per second (RPS)
* Deliveries per second
* Queue throughput
* Retry behavior under failure

---

## Tech Stack

* **Node.js + TypeScript**
* **Fastify**
* **BullMQ + Redis**
* **PostgreSQL + Drizzle ORM**

---

## Inspiration

Built as a system design project inspired by real-world webhook infrastructures like those used by companies such as Stripe.

---

## Future Improvements

* SDK for developers
* Dashboard UI
* Kafka-based queue support
* Distributed tracing
* Rate limiting per endpoint

---

## Contributing

PRs are welcome! Feel free to open issues or suggest improvements.

---

## License

MIT
