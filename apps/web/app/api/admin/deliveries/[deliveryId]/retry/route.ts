import { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";

const FASTIFY_API_URL = process.env.FASTIFY_API_URL ?? "http://localhost:3000";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

type Params = { params: Promise<{ deliveryId: string }> };

// POST /api/admin/deliveries/[deliveryId]/retry
// Proxies to Fastify: POST /admin/deliveries/:id/retry
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    // Must be authenticated as a dashboard user
    await requireSession();

    const { deliveryId } = await params;

    const upstream = await fetch(
      `${FASTIFY_API_URL}/admin/deliveries/${deliveryId}/retry`,
      {
        method: "POST",
        headers: {
          "x-admin-key": ADMIN_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    const body = await upstream.json();

    if (!upstream.ok) {
      return errResponse(body?.error ?? "Upstream error", upstream.status);
    }

    return okResponse(body?.data ?? body, upstream.status);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST retry delivery]", err);
    return errResponse("Internal server error", 500);
  }
}
