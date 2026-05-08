import { NextRequest } from "next/server";
import { db } from "@hookrelay/db";
import { events } from "@hookrelay/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { assertTenantOwner } from "@/lib/tenant-guard";

type Params = { params: Promise<{ tenantId: string }> };

// GET /api/tenants/[tenantId]/events?page=1&limit=50&eventType=order.placed
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { tenantId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const eventType = searchParams.get("eventType") ?? undefined;
    const offset = (page - 1) * limit;

    const where = eventType
      ? and(eq(events.tenantId, tenantId), eq(events.eventType, eventType))
      : eq(events.tenantId, tenantId);

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(events)
        .where(where)
        .orderBy(desc(events.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(events)
        .where(where),
    ]);

    const total = countResult[0]?.count ?? 0;

    return okResponse({
      events: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET events]", err);
    return errResponse("Internal server error", 500);
  }
}
