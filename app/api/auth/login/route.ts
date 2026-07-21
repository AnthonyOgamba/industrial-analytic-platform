import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, AUTH_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { backendError, gatewayFailure, requestBackend } from "@/lib/backend-api";
import type { LoginResponseDto, PublicSessionDto } from "@/lib/backend-dtos";

export const runtime = "nodejs";

const schema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(256),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  try {
    const { response: backendResponse, body } = await requestBackend<LoginResponseDto>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: backendError(body, backendResponse.status === 401 ? "Invalid credentials" : "Sign in could not be completed.") },
        { status: backendResponse.status },
      );
    }
    if (!body?.token || !body.username || !body.role || typeof body.uid !== "number") {
      return NextResponse.json({ error: "Authentication service returned an invalid session response." }, { status: 502 });
    }
    const publicSession: PublicSessionDto = { username: body.username, role: body.role, uid: body.uid };
    const response = NextResponse.json(publicSession);
    response.cookies.set(AUTH_COOKIE, body.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    return gatewayFailure(error);
  }
}
