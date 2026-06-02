import { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";

const FASTIFY_API_URL = process.env.FASTIFY_API_URL ?? "http://localhost:8080";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

type Params = { params: Promise<{ endpointId: string }> };

// POST /api/admin/endpoints/[endpointId]/reset-circuit
// Proxies to Fastify: POST /admin/endpoints/:id/reset-circuit
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireSession();

    const { endpointId } = await params;

    const upstream = await fetch(
      `${FASTIFY_API_URL}/admin/endpoints/${endpointId}/reset-circuit`,
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
    console.error("[POST reset circuit]", err);
    return errResponse("Internal server error", 500);
  }
}
