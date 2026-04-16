import { db } from "../index";
import { tenants } from "../schema";
import { eq } from "drizzle-orm";
import type { NewTenant, Tenant } from "../schema";

/**
 * Find tenant by API key hash
 * Used in auth middleware
 */

export const findTenantByApiKeyHash = async (apiKeyHash: string): Promise<Tenant | null> => {
    const result = await db
        .select()
        .from(tenants)
        .where(eq(tenants.apiKeyHash, apiKeyHash)).limit(1);

    return result[0] ?? null;
}

/**
 * Find tenant by ID
 */

export const findTenantById = async (id: string): Promise<Tenant | null> => {
    const result = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, id)).limit(1);

    return result[0] ?? null;
}

/**
 * Create a new tenant
 */

export async function createTenant(
    data: NewTenant
): Promise<Tenant> {
    const result = await db
        .insert(tenants)
        .values(data)
        .returning();

    return result[0]!;
}

/**
 * Update tenant (partial update)
 */
export async function updateTenant(
    tenantId: string,
    data: Partial<NewTenant>
): Promise<Tenant | null> {
    const result = await db
        .update(tenants)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId))
        .returning();

    return result[0] ?? null;
}

/**
 * Deactivate tenant (soft disable)
 */
export async function deactivateTenant(
    tenantId: string
): Promise<void> {
    await db
        .update(tenants)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId));
}

/**
 * Rotate API key (update hash)
 */
export async function rotateApiKey(
    tenantId: string,
    newApiKeyHash: string
): Promise<void> {
    await db
        .update(tenants)
        .set({
            apiKeyHash: newApiKeyHash,
            updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId));
}