import { db } from "../index";
import { endpoints } from "../schema";
import { eq, and, sql } from "drizzle-orm";
import type { NewEndpoint, Endpoint } from "../schema";

/**
 * Find endpoint by ID
 */

export const findEndpointById = async (id: string): Promise<Endpoint | null> => {
    const result = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.id, id)).limit(1);

    return result[0] ?? null;
}


/**
 * Create a new endpoint
 */

export async function createEndpoint(
    data: NewEndpoint
): Promise<Endpoint> {
    const result = await db
        .insert(endpoints)
        .values(data)
        .returning();

    return result[0]!;
}

/**
 * Update endpoint (partial update)
 */
export async function updateEndpoint(
    endpointId: string,
    data: Partial<NewEndpoint>
): Promise<Endpoint | null> {
    const result = await db
        .update(endpoints)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(endpoints.id, endpointId))
        .returning();

    return result[0] ?? null;
}

/**
 * Delete endpoint
 */
export async function deleteEndpoint(
    endpointId: string
): Promise<void> {
    await db
        .delete(endpoints)
        .where(eq(endpoints.id, endpointId));
}

/**
 * Find endpoints by tenant ID
 */

export const findEndpointsByTenantId = async (tenantId: string): Promise<Endpoint[]> => {
    const result = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.tenantId, tenantId));

    return result;
}

/**
 * Find endpoint by Tenant ID and Event type
 */

export const findEndpointsByTenantIdAndEventType = async (tenantId: string, eventType: string): Promise<Endpoint[]> => {
    const result = await db
        .select()
        .from(endpoints)
        .where(
            and(
                eq(endpoints.tenantId, tenantId),
                sql`${endpoints.eventTypeFilter} @> ${JSON.stringify([eventType])}::jsonb`
            )
        );

    return result;
}

/**
 * Update endpoint stats
 */

export const updateEndpointStats = async (endpointId: string, stats: Partial<Endpoint>): Promise<void> => {
    await db
        .update(endpoints)
        .set({
            ...stats,
            updatedAt: new Date(),
        })
        .where(eq(endpoints.id, endpointId));
}

/**
 * Increment failure count
 */

export const incrementFailureCount = async (endpointId: string): Promise<void> => {
    await db
        .update(endpoints)
        .set({
            failureCount: Number(endpoints.failureCount) + 1,
            updatedAt: new Date(),
        })
        .where(eq(endpoints.id, endpointId));
}