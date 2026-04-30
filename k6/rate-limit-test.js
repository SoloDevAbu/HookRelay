import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

// Tests that rate limiting kicks in correctly
// when a tenant exceeds their per-minute limit

const rateLimitedCount = new Counter("rate_limited_responses");
const acceptedCount = new Counter("accepted_responses");

export const options = {
  vus: 50,
  duration: "30s",
  thresholds: {
    rate_limited_responses: ["count>0"], // we EXPECT some 429s
  },
};

export function setup() {
  const res = http.post(
    "http://localhost:3000/tenants",
    JSON.stringify({ name: "rate-limit-test", rateLimitPerMin: 100 }),
    { headers: { "Content-Type": "application/json" } },
  );
  return { apiKey: JSON.parse(res.body).data.apiKey };
}

export default function (data) {
  const res = http.post(
    "http://localhost:3000/events",
    JSON.stringify({
      eventType: "test.event",
      payload: { test: true },
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": data.apiKey,
      },
    },
  );

  if (res.status === 429) {
    rateLimitedCount.add(1);
    check(res, {
      "has Retry-After header": (r) => r.headers["Retry-After"] !== undefined,
    });
  } else if (res.status === 202) {
    acceptedCount.add(1);
  }
}
