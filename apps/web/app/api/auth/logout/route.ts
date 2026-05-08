import { okResponse } from "@/lib/response";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const response = okResponse({ message: "Logged out" });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
