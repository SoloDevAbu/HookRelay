import { NextResponse } from "next/server";

/** Typed JSON success response */
export function okResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/** Typed JSON error response (also throwable) */
export function errResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}
