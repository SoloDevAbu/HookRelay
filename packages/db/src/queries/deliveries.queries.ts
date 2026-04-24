import { db } from "../index";
import { eq, and, lt, sql } from "drizzle-orm";
import type { Delivery, NewDelivery } from "../schema";
import { deliveries } from "../schema";

/**
 * Batch insert deliveries
 */

export const batchInsertDeliveries = async (
  input: {
    eventId: string;
    endpointId: string;
    tenantId: string;
  }[],
): Promise<Delivery[]> => {
  if (input.length === 0) return [];

  return db
    .insert(deliveries)
    .values(
      input.map((i) => ({
        eventId: i.eventId,
        endpointId: i.endpointId,
        tenantId: i.tenantId,
        status: "pending" as const,
        attemptCount: 0,
      })),
    )
    .returning();
};

/**
 * Update delivery status
 */

export const updateDeliveryStatus = async (
  deliveryId: string,
  data: {
    status: Delivery["status"];
    attemptCount?: number;
    nextRetryAt?: Date | null;
    exhaustedAt?: Date | null;
  },
): Promise<Delivery | null> => {
  const result = await db
    .update(deliveries)
    .set({
      status: data.status,
      attemptCount: data.attemptCount,
      nextRetryAt: data.nextRetryAt,
      exhaustedAt: data.exhaustedAt,
      updatedAt: new Date(),
    })
    .where(eq(deliveries.id, deliveryId))
    .returning();

  return result[0] ?? null;
};

/**
 * Find deliveries pending retry
 */

export const findDeliveryPendingRetry = async (
  limit: number,
): Promise<Delivery[]> => {
  const now = new Date();

  const result = await db
    .select()
    .from(deliveries)
    .where(
      and(eq(deliveries.status, "pending"), lt(deliveries.nextRetryAt, now)),
    )
    .limit(limit);

  return result;
};

/**
 * Mark delivery dead
 */

export const markDeliveryDead = async (deliveryId: string): Promise<void> => {
  await db
    .update(deliveries)
    .set({ status: "dead", updatedAt: new Date() })
    .where(eq(deliveries.id, deliveryId));
};

/**
 * Find deliveries by tenant
 */

export const findDeliveriesByTenant = async (
  tenantId: string,
  options: {
    status?: Delivery["status"];
    limit?: number;
    nextRetryAt?: Date;
    exhaustedAt?: Date;
  },
): Promise<Delivery[]> => {
  const result = await db
    .select()
    .from(deliveries)
    .where(
      options.status
        ? and(
            eq(deliveries.tenantId, tenantId),
            eq(deliveries.status, options.status),
          )
        : options.nextRetryAt
          ? and(
              eq(deliveries.tenantId, tenantId),
              lt(deliveries.nextRetryAt, options.nextRetryAt),
            )
          : options.exhaustedAt
            ? and(
                eq(deliveries.tenantId, tenantId),
                eq(deliveries.exhaustedAt, options.exhaustedAt),
              )
            : eq(deliveries.tenantId, tenantId),
    )
    .limit(options.limit ?? 100);

  return result;
};

/**
 * Increment delivery attempt
 * @returns attempt count
 */
export const incrementDeliveryAttempt = async (
  deliveryId: string,
): Promise<{ attemptCount: number } | undefined> => {
  const result = await db
    .update(deliveries)
    .set({
      attemptCount: sql`${deliveries.attemptCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(deliveries.id, deliveryId))
    .returning({ attemptCount: deliveries.attemptCount });

  return result[0];
};
