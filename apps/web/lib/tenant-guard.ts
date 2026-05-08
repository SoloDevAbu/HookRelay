import { findTenantById } from "@hookrelay/db";
import type { Tenant } from "@hookrelay/db";
import { errResponse } from "@/lib/response";

/**
 * Fetch a tenant by ID and verify it belongs to the given user.
 * Throws a Response (404 or 403) if the check fails.
 */
export async function assertTenantOwner(
  tenantId: string,
  userId: string
): Promise<Tenant> {
  const tenant = await findTenantById(tenantId);

  if (!tenant) {
    throw errResponse("Tenant not found", 404);
  }

  if (tenant.userId !== userId) {
    throw errResponse("Forbidden", 403);
  }

  return tenant;
}
