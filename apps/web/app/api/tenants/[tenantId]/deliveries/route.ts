import { NextRequest } from "next/server";
import { db } from "@hookrelay/db";
import { deliveries, type Delivery } from "@hookrelay/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { assertTenantOwner } from "@/lib/tenant-guard";

type Params = { params: Promise<{ tenantId: string }> };

const VALID_STATUSES = ["pending", "success", "failed", "dead"] as const;

// GET /api/tenants/[tenantId]/deliveries?status=failed&page=1&limit=50
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { tenantId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const statusParam = searchParams.get("status");
    const offset = (page - 1) * limit;

    if (statusParam && !VALID_STATUSES.includes(statusParam as Delivery["status"])) {
      return errResponse(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        400
      );
    }

    const status = statusParam as Delivery["status"] | undefined;

    const where = status
      ? and(eq(deliveries.tenantId, tenantId), eq(deliveries.status, status))
      : eq(deliveries.tenantId, tenantId);

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(deliveries)
        .where(where)
        .orderBy(desc(deliveries.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(deliveries)
        .where(where),
    ]);

    const total = countResult[0]?.count ?? 0;

    return okResponse({
      deliveries: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET deliveries]", err);
    return errResponse("Internal server error", 500);
  }
}
