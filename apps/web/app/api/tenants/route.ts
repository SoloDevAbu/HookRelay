import { NextRequest } from "next/server";
import { findTenantsByUserId, createTenant } from "@hookrelay/db";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { generateApiKey, hashApiKey } from "@/lib/crypto";

// GET /api/tenants — list all tenants owned by the current user
export async function GET() {
  try {
    const session = await requireSession();
    const tenants = await findTenantsByUserId(session.userId);

    return okResponse({ tenants });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenants]", err);
    return errResponse("Internal server error", 500);
  }
}

// POST /api/tenants — create a new tenant (generates API key, returns it once)
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { name, rateLimitPerMin } = body ?? {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return errResponse("name is required", 400);
    }

    if (name.trim().length > 100) {
      return errResponse("name must be 100 characters or less", 400);
    }

    if (
      rateLimitPerMin !== undefined &&
      (typeof rateLimitPerMin !== "number" ||
        rateLimitPerMin < 1 ||
        rateLimitPerMin > 100_000)
    ) {
      return errResponse("rateLimitPerMin must be between 1 and 100000", 400);
    }

    const rawApiKey = generateApiKey();
    const apiKeyHash = hashApiKey(rawApiKey);

    const tenant = await createTenant({
      name: name.trim(),
      userId: session.userId,
      apiKeyHash,
      rateLimitPerMin: rateLimitPerMin ?? 1000,
    });

    return okResponse(
      {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          rateLimitPerMin: tenant.rateLimitPerMin,
          isActive: tenant.isActive,
          createdAt: tenant.createdAt,
        },
        apiKey: rawApiKey,
        warning: "Store this API key safely. It will never be shown again.",
      },
      201
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenants]", err);
    return errResponse("Internal server error", 500);
  }
}
