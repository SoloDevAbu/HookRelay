import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ─────────────────────────────────────────
// CUSTOM METRICS
// ─────────────────────────────────────────

const errorRate = new Rate("error_rate");
const ingestLatency = new Trend("ingest_latency", true);
const duplicateRate = new Rate("duplicate_rate");
const successfulIngests = new Counter("successful_ingests");

// ─────────────────────────────────────────
// TEST CONFIGURATION
// Three stages:
// 1. Ramp up   — gradually increase load
// 2. Sustained — hold peak load
// 3. Ramp down — gracefully reduce
// ─────────────────────────────────────────

export const options = {
  stages: [
    { duration: "30s", target: 50 }, // ramp up to 50 VUs
    { duration: "1m", target: 50 }, // hold 50 VUs for 1 minute
    { duration: "30s", target: 100 }, // ramp up to 100 VUs
    { duration: "1m", target: 100 }, // hold 100 VUs for 1 minute
    { duration: "30s", target: 200 }, // ramp up to 200 VUs
    { duration: "1m", target: 200 }, // hold 200 VUs for 1 minute
    { duration: "30s", target: 0 }, // ramp down
  ],
  thresholds: {
    // 95% of requests must complete under 500ms
    http_req_duration: ["p(95)<500"],
    // 99% of requests must complete under 1000ms
    "http_req_duration{name:ingest}": ["p(99)<1000"],
    // error rate must stay below 1%
    error_rate: ["rate<0.01"],
    // p50 must be under 100ms
    "http_req_duration{name:ingest}": ["p(50)<100"],
  },
};

const BASE_URL = "http://localhost:3000";

// ─────────────────────────────────────────
// SETUP — runs once before all VUs start
// Creates one tenant and one endpoint
// shared across all virtual users
// ─────────────────────────────────────────

export function setup() {
  // create tenant
  const tenantRes = http.post(
    `${BASE_URL}/tenants`,
    JSON.stringify({
      name: "k6-load-test-tenant5",
      rateLimitPerMin: 100000,
    }),
    { headers: { "Content-Type": "application/json" } },
  );

  check(tenantRes, {
    "tenant created": (r) => r.status === 201,
  });

  const { data } = JSON.parse(tenantRes.body);
  const apiKey = data.apiKey;
  const tenantId = data.tenant.id;

  // create endpoint pointing to webhook.site or a local mock
  const endpointRes = http.post(
    `${BASE_URL}/endpoints`,
    JSON.stringify({
      url: "http://mock-server:4000/webhook",
      eventTypeFilter: ["order.placed"],
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
    },
  );

  check(endpointRes, {
    "endpoint created": (r) => r.status === 201,
  });

  return { apiKey, tenantId };
}

// ─────────────────────────────────────────
// DEFAULT FUNCTION — runs per VU per iteration
// ─────────────────────────────────────────

export default function (data) {
  const { apiKey } = data;

  const payload = {
    eventType: "order.placed",
    payload: {
      orderId: `ord_${Math.random().toString(36).slice(2, 10)}`,
      amount: Math.floor(Math.random() * 10000),
      currency: "INR",
      customer: {
        id: `cust_${Math.random().toString(36).slice(2, 10)}`,
        email: "test@example.com",
      },
    },
    // no idempotency key — each request is unique
    // this maximises ingest throughput for load testing
  };

  const start = Date.now();

  const res = http.post(`${BASE_URL}/events`, JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    tags: { name: "ingest" }, // tag for per-route metrics
  });

  const latency = Date.now() - start;
  ingestLatency.add(latency);

  const success = check(res, {
    "status is 202": (r) => r.status === 202,
    "has eventId": (r) => {
      try {
        return JSON.parse(r.body).data.eventId !== undefined;
      } catch {
        return false;
      }
    },
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);

  if (success) {
    successfulIngests.add(1);
  }

  // no sleep — maximum throughput test
  // add sleep(0.1) if you want to simulate realistic traffic
}

// ─────────────────────────────────────────
// IDEMPOTENCY TEST — separate scenario
// Run with: k6 run --env SCENARIO=idempotency k6/load-test.js
// ─────────────────────────────────────────

export function idempotencyTest(data) {
  const { apiKey } = data;

  const fixedPayload = {
    eventType: "order.placed",
    payload: { orderId: "ord_idempotency_test" },
    idempotencyKey: "idempotency-test-fixed-key",
  };

  const res = http.post(`${BASE_URL}/events`, JSON.stringify(fixedPayload), {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
  });

  check(res, {
    "first call returns 202 or duplicate 200": (r) =>
      r.status === 202 || r.status === 200,
    "duplicate flag present": (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.data.duplicate === "boolean";
      } catch {
        return false;
      }
    },
  });
}
