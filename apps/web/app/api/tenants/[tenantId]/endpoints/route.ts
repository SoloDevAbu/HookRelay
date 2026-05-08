import { NextRequest } from "next/server";
import { db } from "@hookrelay/db";
import { endpoints } from "@hookrelay/db";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { assertTenantOwner } from "@/lib/tenant-guard";
import crypto from "crypto";

type Params = { params: Promise<{ tenantId: string }> };

// GET /api/tenants/[tenantId]/endpoints
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenantId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const rows = await db
      .select()
      .from(endpoints)
      .where(eq(endpoints.tenantId, tenantId));

    return okResponse({ endpoints: rows });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET endpoints]", err);
    return errResponse("Internal server error", 500);
  }
}

// POST /api/tenants/[tenantId]/endpoints
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { tenantId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const body = await req.json();
    const { url, eventTypeFilter, customHeaders } = body ?? {};

    if (!url || typeof url !== "string") {
      return errResponse("url is required and must be a string", 400);
    }

    try {
      new URL(url);
    } catch {
      return errResponse("url must be a valid URL", 400);
    }

    if (eventTypeFilter !== undefined && !Array.isArray(eventTypeFilter)) {
      return errResponse("eventTypeFilter must be an array of strings or null", 400);
    }

    // Generate a signing secret for this endpoint
    const secret = `whsec_${crypto.randomBytes(32).toString("hex")}`;

    const [endpoint] = await db
      .insert(endpoints)
      .values({
        tenantId,
        url,
        secret,
        status: "active",
        eventTypeFilter: eventTypeFilter ?? null,
        customHeaders: customHeaders ?? {},
      })
      .returning();

    return okResponse({ endpoint }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST endpoints]", err);
    return errResponse("Internal server error", 500);
  }
}
