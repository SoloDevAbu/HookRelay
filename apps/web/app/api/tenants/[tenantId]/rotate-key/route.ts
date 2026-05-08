import { NextRequest } from "next/server";
import { rotateApiKey } from "@hookrelay/db";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";
import { assertTenantOwner } from "@/lib/tenant-guard";
import { generateApiKey, hashApiKey } from "@/lib/crypto";

type Params = { params: Promise<{ tenantId: string }> };

// POST /api/tenants/[tenantId]/rotate-key
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { tenantId } = await params;
    const session = await requireSession();
    await assertTenantOwner(tenantId, session.userId);

    const rawApiKey = generateApiKey();
    const newHash = hashApiKey(rawApiKey);

    await rotateApiKey(tenantId, newHash);

    return okResponse({
      apiKey: rawApiKey,
      warning: "Your old API key has been invalidated. Store this new key safely — it will not be shown again.",
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST rotate-key]", err);
    return errResponse("Internal server error", 500);
  }
}
