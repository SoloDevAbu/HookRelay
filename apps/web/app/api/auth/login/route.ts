import { NextRequest } from "next/server"
import { findUserByEmail } from "@hookrelay/db"
import { signJwt, verifyPassword } from "@/lib/auth"
import { okResponse, errResponse } from "@/lib/response"
import { SESSION_COOKIE } from "@/lib/session"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body ?? {}

    if (!email || !password) {
      return errResponse("email and password are required", 400)
    }

    const user = await findUserByEmail(email.toLowerCase())

    const isValid = user
      ? await verifyPassword(password, user.passwordHash)
      : false

    if (!user || !isValid) {
      return errResponse("Invalid email or password", 401)
    }

    const token = await signJwt({ userId: user.id, email: user.email })

    const response = okResponse({
      user: { id: user.id, email: user.email, name: user.name },
    })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (err) {
    console.error("[login]", err)
    return errResponse("Internal server error", 500)
  }
}
