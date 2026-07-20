import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GENERIC_RESET_MESSAGE, RESET_TOKEN_TTL_MINUTES } from "@/lib/auth/constants";
import { findUser, getDatabase } from "@/lib/auth/database";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { hashSecret } from "@/lib/auth/jwt";
import { rateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";
const schema = z.object({ identifier: z.string().trim().min(1).max(254) });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address or username." }, { status: 400 });
  const identifier = parsed.data.identifier.toLowerCase();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`reset-ip:${ip}`, 8, 60 * 60_000) || !rateLimit(`reset-id:${hashSecret(identifier)}`, 4, 60 * 60_000)) {
    return NextResponse.json({ message: GENERIC_RESET_MESSAGE });
  }
  const user = findUser(identifier);
  getDatabase().prepare("INSERT INTO auth_audit_events (user_id, event_type, outcome, ip_address, created_at_utc) VALUES (?, 'password_reset_requested', 'accepted', ?, ?)")
    .run(user?.id || null, ip, new Date().toISOString());
  if (user?.active) {
    const rawToken = randomBytes(32).toString("base64url");
    const now = new Date();
    const expires = new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60_000);
    const db = getDatabase();
    const create = db.transaction(() => {
      db.prepare("UPDATE password_reset_tokens SET revoked_at_utc = ? WHERE user_id = ? AND used_at_utc IS NULL AND revoked_at_utc IS NULL")
        .run(now.toISOString(), user.id);
      db.prepare(
        `INSERT INTO password_reset_tokens
          (user_id, token_hash, expires_at_utc, created_at_utc, requested_ip) VALUES (?, ?, ?, ?, ?)`,
      ).run(user.id, hashSecret(rawToken), expires.toISOString(), now.toISOString(), ip);
    });
    create();
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const resetUrl = new URL("/reset-password", origin);
    resetUrl.searchParams.set("token", rawToken);
    await sendPasswordResetEmail(user.email, resetUrl.toString()).catch((error) => {
      console.error("Password reset delivery failed:", error instanceof Error ? error.message : "unknown error");
    });
  }
  return NextResponse.json({ message: GENERIC_RESET_MESSAGE });
}
