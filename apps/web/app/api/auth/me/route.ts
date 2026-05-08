import { findUserById } from "@hookrelay/db";
import { requireSession } from "@/lib/session";
import { okResponse, errResponse } from "@/lib/response";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await findUserById(session.userId);

    if (!user) {
      return errResponse("User not found", 404);
    }

    return okResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[me]", err);
    return errResponse("Internal server error", 500);
  }
}
