import { NextRequest } from "next/server";
import { db } from "@hookrelay/db";
import { events, deliveries } from "@hookrelay/db";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { assertTenantOwner } from "@/lib/tenant-guard";

type Params = { params: Promise<{ tenantId: string; eventId: string }> };

// GET /api/tenants/[tenantId]/events/[eventId]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenantId, eventId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.tenantId, tenantId)))
      .limit(1);

    if (!event) {
      return errResponse("Event not found", 404);
    }

    const eventDeliveries = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.eventId, eventId));

    return okResponse({ event, deliveries: eventDeliveries });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET event detail]", err);
    return errResponse("Internal server error", 500);
  }
}
