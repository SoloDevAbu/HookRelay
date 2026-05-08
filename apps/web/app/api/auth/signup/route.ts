import { NextRequest } from "next/server";
import { findUserByEmail, createUser } from "@hookrelay/db";
import { signJwt, hashPassword } from "@/lib/auth";
import { okResponse, errResponse } from "@/lib/response";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body ?? {};

    if (!email || !password || !name) {
      return errResponse("email, password, and name are required", 400);
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return errResponse("Invalid email address", 400);
    }

    if (typeof password !== "string" || password.length < 8) {
      return errResponse("Password must be at least 8 characters", 400);
    }

    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      return errResponse("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email: email.toLowerCase(),
      passwordHash,
      name,
    });

    const token = await signJwt({ userId: user.id, email: user.email });

    const response = okResponse(
      { user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt } },
      201
    );

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[signup]", err);
    return errResponse("Internal server error", 500);
  }
}
