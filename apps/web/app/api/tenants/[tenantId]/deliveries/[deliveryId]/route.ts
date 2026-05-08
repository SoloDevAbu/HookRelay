import { NextRequest } from "next/server";
import { db } from "@hookrelay/db";
import { deliveries, deliveryAttempts } from "@hookrelay/db";
import { eq, and, desc } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { assertTenantOwner } from "@/lib/tenant-guard";

type Params = { params: Promise<{ tenantId: string; deliveryId: string }> };

// GET /api/tenants/[tenantId]/deliveries/[deliveryId]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenantId, deliveryId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const [delivery] = await db
      .select()
      .from(deliveries)
      .where(
        and(eq(deliveries.id, deliveryId), eq(deliveries.tenantId, tenantId))
      )
      .limit(1);

    if (!delivery) {
      return errResponse("Delivery not found", 404);
    }

    const attempts = await db
      .select()
      .from(deliveryAttempts)
      .where(eq(deliveryAttempts.deliveryId, deliveryId))
      .orderBy(desc(deliveryAttempts.attemptedAt));

    return okResponse({ delivery, attempts });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET delivery detail]", err);
    return errResponse("Internal server error", 500);
  }
}
