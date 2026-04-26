import { eq, and, isNull, sql, notExists, lt } from "drizzle-orm";
import { db } from "../index";
import { deliveries, events } from "../schema";
import type { Event, NewEvent } from "../schema";

/**
 * Create a new event
 */

export const createEvent = async (
  data: NewEvent,
): Promise<{ event: Event; wasCreated: boolean }> => {
  const result = await db
    .insert(events)
    .values(data)
    .onConflictDoNothing()
    .returning();

  if (result.length > 0) {
    return { event: result[0]!, wasCreated: true };
  }

  const existing = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.tenantId, data.tenantId),
        data.idempotencyKey
          ? eq(events.idempotencyKey, data.idempotencyKey)
          : isNull(events.idempotencyKey),
      ),
    );

  return { event: existing[0]!, wasCreated: false };
};

/**
 * Find event by ID
 */

export const findEventById = async (id: string): Promise<Event | null> => {
  const result = await db.select().from(events).where(eq(events.id, id));

  return result[0] ?? null;
};

/**
 * Find events by tenant ID
 */

export const findEventsByTenantId = async (
  tenantId: string,
): Promise<Event[]> => {
  const result = await db
    .select()
    .from(events)
    .where(eq(events.tenantId, tenantId));

  return result;
};

/**
 * Find events by type
 */

export const findEventsByType = async (type: string): Promise<Event[]> => {
  const result = await db
    .select()
    .from(events)
    .where(eq(events.eventType, type));

  return result;
};

/**
 * Delete event
 */

export const deleteEvent = async (id: string): Promise<void> => {
  await db.delete(events).where(eq(events.id, id));
};

/**
 * Find all the event with no deliveries
 * @param input
 * @returns Events
 */
export const findEventsWithNoDeliveries = async (input: {
  olderThenMinutes: number;
  limit: number;
}): Promise<Event[]> => {
  return db
    .select()
    .from(events)
    .where(
      and(
        lt(
          events.createdAt,
          sql`NOW() - INTERVAL '${sql.raw(input.olderThenMinutes.toString())} minutes'`,
        ),
        notExists(
          db.select().from(deliveries).where(eq(deliveries.eventId, events.id)),
        ),
      ),
    );
};
