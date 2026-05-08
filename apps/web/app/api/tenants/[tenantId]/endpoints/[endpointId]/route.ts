import { NextRequest } from "next/server";
import { db } from "@hookrelay/db";
import { endpoints } from "@hookrelay/db";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { assertTenantOwner } from "@/lib/tenant-guard";

type Params = { params: Promise<{ tenantId: string; endpointId: string }> };

const VALID_STATUSES = ["active", "paused"] as const;

// PATCH /api/tenants/[tenantId]/endpoints/[endpointId]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { tenantId, endpointId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    // Verify endpoint belongs to this tenant
    const [existing] = await db
      .select()
      .from(endpoints)
      .where(and(eq(endpoints.id, endpointId), eq(endpoints.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return errResponse("Endpoint not found", 404);
    }

    const body = await req.json();
    const { url, status, eventTypeFilter, customHeaders } = body ?? {};

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (url !== undefined) {
      try {
        new URL(url);
        updates.url = url;
      } catch {
        return errResponse("url must be a valid URL", 400);
      }
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return errResponse(`status must be one of: ${VALID_STATUSES.join(", ")}`, 400);
      }
      updates.status = status;
    }

    if (eventTypeFilter !== undefined) {
      if (eventTypeFilter !== null && !Array.isArray(eventTypeFilter)) {
        return errResponse("eventTypeFilter must be an array or null", 400);
      }
      updates.eventTypeFilter = eventTypeFilter;
    }

    if (customHeaders !== undefined) {
      if (typeof customHeaders !== "object" || Array.isArray(customHeaders)) {
        return errResponse("customHeaders must be a plain object", 400);
      }
      updates.customHeaders = customHeaders;
    }

    const [updated] = await db
      .update(endpoints)
      .set(updates)
      .where(eq(endpoints.id, endpointId))
      .returning();

    return okResponse({ endpoint: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH endpoint]", err);
    return errResponse("Internal server error", 500);
  }
}

// DELETE /api/tenants/[tenantId]/endpoints/[endpointId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenantId, endpointId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const [existing] = await db
      .select()
      .from(endpoints)
      .where(and(eq(endpoints.id, endpointId), eq(endpoints.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return errResponse("Endpoint not found", 404);
    }

    await db.delete(endpoints).where(eq(endpoints.id, endpointId));

    return okResponse({ deleted: true, endpointId });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE endpoint]", err);
    return errResponse("Internal server error", 500);
  }
}
