// src/db/schema.ts

import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    boolean,
    jsonb,
    pgEnum,
    index,
    unique,
  } from "drizzle-orm/pg-core";
  
  // ─────────────────────────────────────────
  // ENUMS
  // ─────────────────────────────────────────
  
  export const deliveryStatusEnum = pgEnum("delivery_status", [
    "pending",
    "success",
    "failed",
    "dead",       // exhausted all retries, moved to DLQ
  ]);
  
  export const endpointStatusEnum = pgEnum("endpoint_status", [
    "active",
    "paused",     // manually paused by tenant
    "degraded",   // circuit breaker opened it
  ]);
  
  export const attemptStatusEnum = pgEnum("attempt_status", [
    "success",
    "failed",
    "timeout",
  ]);
  
  // ─────────────────────────────────────────
  // TENANTS
  // ─────────────────────────────────────────
  
  export const tenants = pgTable("tenants", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
  
    // we never store raw API key, only a SHA-256 hash of it
    // on every request we hash the incoming key and compare
    apiKeyHash: text("api_key_hash").notNull().unique(),
  
    // how many events per minute this tenant is allowed to ingest
    rateLimitPerMin: integer("rate_limit_per_min").notNull().default(1000),
  
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  });
  
  // ─────────────────────────────────────────
  // ENDPOINTS
  // ─────────────────────────────────────────
  
  export const endpoints = pgTable(
    "endpoints",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
  
      url: text("url").notNull(),
  
      // secret used to sign every payload sent to this endpoint
      // tenant uses this to verify the webhook came from us
      secret: text("secret").notNull(),
  
      status: endpointStatusEnum("status").notNull().default("active"),
  
      // null means receive ALL event types
      // ["order.placed", "order.cancelled"] means only those types
      eventTypeFilter: jsonb("event_type_filter").$type<string[] | null>().default(null),
  
      // injected into every outbound request to this endpoint
      customHeaders: jsonb("custom_headers").$type<Record<string, string>>().default({}),
  
      // for endpoint verification handshake (like Stripe does)
      isVerified: boolean("is_verified").notNull().default(false),
      verificationToken: text("verification_token"),
  
      // circuit breaker: consecutive failure count
      // tracked in Redis but also persisted here periodically
      failureCount: integer("failure_count").notNull().default(0),
  
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
      tenantIdIdx: index("endpoints_tenant_id_idx").on(table.tenantId),
      statusIdx: index("endpoints_status_idx").on(table.status),
    })
  );
  
  // ─────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────
  
  export const events = pgTable(
    "events",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
  
      // e.g. "order.placed", "payment.failed", "user.signup"
      eventType: text("event_type").notNull(),
  
      // raw payload sent by the producer — stored as-is
      payload: jsonb("payload").notNull(),
  
      // producer sends this to prevent duplicate processing
      // we store it and reject any event with the same key
      // within a 24h window (enforced in Redis, persisted here)
      idempotencyKey: text("idempotency_key"),
  
      createdAt: timestamp("created_at").notNull().defaultNow(),
    },
    (table) => ({
      tenantIdIdx: index("events_tenant_id_idx").on(table.tenantId),
      eventTypeIdx: index("events_event_type_idx").on(table.eventType),
      idempotencyKeyIdx: index("events_idempotency_key_idx").on(table.idempotencyKey),
      createdAtIdx: index("events_created_at_idx").on(table.createdAt),
  
      // one idempotency key per tenant — not globally unique
      uniqueIdempotencyPerTenant: unique("unique_idempotency_per_tenant").on(
        table.tenantId,
        table.idempotencyKey
      ),
    })
  );
  
  // ─────────────────────────────────────────
  // DELIVERIES
  // ─────────────────────────────────────────
  
  // one delivery = one event going to one endpoint
  // if an event fans out to 500 endpoints = 500 delivery rows
  
  export const deliveries = pgTable(
    "deliveries",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      eventId: uuid("event_id")
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
      endpointId: uuid("endpoint_id")
        .notNull()
        .references(() => endpoints.id, { onDelete: "cascade" }),
      tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
  
      status: deliveryStatusEnum("status").notNull().default("pending"),
  
      // how many attempts have been made so far
      attemptCount: integer("attempt_count").notNull().default(0),
  
      // when the next retry should be attempted
      // null if succeeded or not yet scheduled
      nextRetryAt: timestamp("next_retry_at"),
  
      // populated when status = "dead"
      exhaustedAt: timestamp("exhausted_at"),
  
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
      eventIdIdx: index("deliveries_event_id_idx").on(table.eventId),
      endpointIdIdx: index("deliveries_endpoint_id_idx").on(table.endpointId),
      tenantIdIdx: index("deliveries_tenant_id_idx").on(table.tenantId),
      statusIdx: index("deliveries_status_idx").on(table.status),
      nextRetryAtIdx: index("deliveries_next_retry_at_idx").on(table.nextRetryAt),
    })
  );
  
  // ─────────────────────────────────────────
  // DELIVERY ATTEMPTS
  // ─────────────────────────────────────────
  
  // one row per actual HTTP call made
  // a delivery can have many attempts (initial + retries)
  
  export const deliveryAttempts = pgTable(
    "delivery_attempts",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      deliveryId: uuid("delivery_id")
        .notNull()
        .references(() => deliveries.id, { onDelete: "cascade" }),
  
      attemptStatus: attemptStatusEnum("attempt_status").notNull(),
  
      // HTTP status code returned by the endpoint
      // null if request never completed (timeout, DNS failure etc)
      statusCode: integer("status_code"),
  
      // first 1000 chars of response body — for debugging
      responseBody: text("response_body"),
  
      // how long the HTTP call took in milliseconds
      latencyMs: integer("latency_ms"),
  
      // if request threw an error before getting a response
      errorMessage: text("error_message"),
  
      attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
    },
    (table) => ({
      deliveryIdIdx: index("attempts_delivery_id_idx").on(table.deliveryId),
      attemptedAtIdx: index("attempts_attempted_at_idx").on(table.attemptedAt),
    })
  );
  
  // ─────────────────────────────────────────
  // EXPORTED TYPES
  // ─────────────────────────────────────────
  
  export type Tenant = typeof tenants.$inferSelect;
  export type NewTenant = typeof tenants.$inferInsert;
  
  export type Endpoint = typeof endpoints.$inferSelect;
  export type NewEndpoint = typeof endpoints.$inferInsert;
  
  export type Event = typeof events.$inferSelect;
  export type NewEvent = typeof events.$inferInsert;
  
  export type Delivery = typeof deliveries.$inferSelect;
  export type NewDelivery = typeof deliveries.$inferInsert;
  
  export type DeliveryAttempt = typeof deliveryAttempts.$inferSelect;
  export type NewDeliveryAttempt = typeof deliveryAttempts.$inferInsert;