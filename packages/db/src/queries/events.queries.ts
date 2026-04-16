import { eq } from "drizzle-orm";
import { db } from "../index";
import { events } from "../schema";
import type { Event, NewEvent } from "../schema";

/**
 * Create a new event
 */

export const createEvent = async (data: NewEvent): Promise<Event> => {
    const result = await db
        .insert(events)
        .values(data)
        .returning();

    return result[0]!;
}

/**
 * Find event by ID
 */

export const findEventById = async (id: string): Promise<Event | null> => {
    const result = await db
        .select()
        .from(events)
        .where(eq(events.id, id));

    return result[0] ?? null;
}

/**
 * Find events by tenant ID
 */

export const findEventsByTenantId = async (tenantId: string): Promise<Event[]> => {
    const result = await db
        .select()
        .from(events)
        .where(eq(events.tenantId, tenantId));

    return result;
}

/**
 * Find events by type
 */

export const findEventsByType = async (type: string): Promise<Event[]> => {
    const result = await db
        .select()
        .from(events)
        .where(eq(events.eventType, type));

    return result;
}

/**
 * Delete event
 */

export const deleteEvent = async (id: string): Promise<void> => {
    await db
        .delete(events)
        .where(eq(events.id, id));
}