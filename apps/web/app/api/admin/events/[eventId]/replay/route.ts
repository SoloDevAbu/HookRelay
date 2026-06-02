import { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";

const FASTIFY_API_URL = process.env.FASTIFY_API_URL ?? "http://localhost:8080";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

type Params = { params: Promise<{ eventId: string }> };

// POST /api/admin/events/[eventId]/replay
// Proxies to Fastify: POST /admin/events/:id/replay
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireSession();

    const { eventId } = await params;

    const upstream = await fetch(
      `${FASTIFY_API_URL}/admin/events/${eventId}/replay`,
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
    console.error("[POST replay event]", err);
    return errResponse("Internal server error", 500);
  }
}
