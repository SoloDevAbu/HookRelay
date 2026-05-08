import { cookies } from "next/headers";
import { verifyJwt, type JwtPayload } from "./auth";
import { errResponse } from "./response";

export const SESSION_COOKIE = "hookrelay_session";

/**
 * Read and validate the session cookie.
 * Returns the JWT payload or null.
 */
export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

/**
 * Require a valid session; throws a 401 Response if missing.
 */
export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session) {
    throw errResponse("Unauthorized", 401);
  }
  return session;
}
