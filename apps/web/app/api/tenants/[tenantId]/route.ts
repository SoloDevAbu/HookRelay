import { NextRequest } from "next/server";
import { updateTenant, deactivateTenant } from "@hookrelay/db";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { assertTenantOwner } from "@/lib/tenant-guard";

type Params = { params: Promise<{ tenantId: string }> };

// GET /api/tenants/[tenantId]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenantId } = await params;
    const session = await requireSession();
    const tenant = await assertTenantOwner(tenantId, session.userId);

    return okResponse({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        rateLimitPerMin: tenant.rateLimitPerMin,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenants/[tenantId]]", err);
    return errResponse("Internal server error", 500);
  }
}

// PATCH /api/tenants/[tenantId]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { tenantId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const body = await req.json();
    const { name, rateLimitPerMin } = body ?? {};

    const updates: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return errResponse("name must be a non-empty string", 400);
      }
      updates.name = name.trim();
    }

    if (rateLimitPerMin !== undefined) {
      if (
        typeof rateLimitPerMin !== "number" ||
        rateLimitPerMin < 1 ||
        rateLimitPerMin > 100_000
      ) {
        return errResponse("rateLimitPerMin must be between 1 and 100000", 400);
      }
      updates.rateLimitPerMin = rateLimitPerMin;
    }

    if (Object.keys(updates).length === 0) {
      return errResponse("No valid fields to update", 400);
    }

    const updated = await updateTenant(tenantId, updates);
    return okResponse({ tenant: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH /api/tenants/[tenantId]]", err);
    return errResponse("Internal server error", 500);
  }
}

// DELETE /api/tenants/[tenantId] — soft deactivate
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenantId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);
    await deactivateTenant(tenantId);

    return okResponse({ deactivated: true, tenantId });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenants/[tenantId]]", err);
    return errResponse("Internal server error", 500);
  }
}
