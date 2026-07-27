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
    if (process.env.NODE_ENV !== "production") {
      console.info("[auth/login] Frontend route called; forwarding to /api/auth/login");
    }
    const { response: backendResponse, body } = await requestBackend<LoginResponseDto>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[auth/login] Upstream status ${backendResponse.status}; token returned: ${Boolean(body?.token)}`,
      );
    }
    if (!backendResponse.ok) {
      const fallback = backendResponse.status === 401
        ? "Invalid credentials"
        : backendResponse.status === 404
          ? "The configured backend gateway does not expose POST /api/auth/login."
          : "Sign in could not be completed.";
      return NextResponse.json(
        { error: backendError(body, fallback) },
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
    if (error instanceof Error && error.message === "BACKEND_API_URL is required in production.") {
      console.error("[auth/login] BACKEND_API_URL is not configured.");
      return NextResponse.json(
        { error: "The frontend authentication gateway is not configured." },
        { status: 500 },
      );
    }
    console.error("[auth/login] Backend authentication request failed.");
    return gatewayFailure(error);
  }
}
