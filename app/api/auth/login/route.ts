import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, AUTH_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { findUser, getDatabase } from "@/lib/auth/database";
import { hashSecret, issueToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(256),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  const user = findUser(parsed.data.username);
  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (!user.active) return NextResponse.json({ error: "Account inactive" }, { status: 403 });
  const { token, jti } = await issueToken({
    uid: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isAdmin: user.role === "admin" || user.role === "super_admin",
  });
  const now = new Date();
  getDatabase()
    .prepare("INSERT INTO auth_sessions (user_id, jwt_id_hash, expires_at_utc, created_at_utc) VALUES (?, ?, ?, ?)")
    .run(user.id, hashSecret(jti), new Date(now.getTime() + AUTH_MAX_AGE_SECONDS * 1000).toISOString(), now.toISOString());
  getDatabase().prepare("INSERT INTO auth_audit_events (user_id, event_type, outcome, ip_address, created_at_utc) VALUES (?, 'login', 'success', ?, ?)")
    .run(user.id, ip, now.toISOString());
  const response = NextResponse.json({ token, username: user.username, role: user.role, uid: user.id });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MAX_AGE_SECONDS,
  });
  return response;
}
