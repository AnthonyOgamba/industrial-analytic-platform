import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/auth/database";
import { hashSecret } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { validatePassword } from "@/lib/auth/password-policy";
import { rateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";
const invalid = "This password reset link is invalid or has expired.";
const schema = z.object({ token: z.string().min(20).max(512), newPassword: z.string().min(1).max(72) });

function tokenRecord(token: string) {
  return getDatabase()
    .prepare(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at_utc IS NULL AND revoked_at_utc IS NULL AND expires_at_utc > ?`,
    )
    .get(hashSecret(token), new Date().toISOString()) as { id: number; user_id: number } | undefined;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  return tokenRecord(token)
    ? NextResponse.json({ valid: true })
    : NextResponse.json({ error: invalid }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`reset-complete:${ip}`, 10, 60 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: invalid }, { status: 400 });
  const passwordError = validatePassword(parsed.data.newPassword);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
  const record = tokenRecord(parsed.data.token);
  if (!record) return NextResponse.json({ error: invalid }, { status: 400 });
  const db = getDatabase();
  const passwordHash = await hashPassword(parsed.data.newPassword);
  const now = new Date().toISOString();
  db.transaction(() => {
    db.prepare("UPDATE users SET password_hash = ?, updated_at_utc = ? WHERE id = ?").run(passwordHash, now, record.user_id);
    db.prepare("UPDATE password_reset_tokens SET used_at_utc = ? WHERE id = ?").run(now, record.id);
    db.prepare("UPDATE password_reset_tokens SET revoked_at_utc = ? WHERE user_id = ? AND id <> ? AND used_at_utc IS NULL")
      .run(now, record.user_id, record.id);
    db.prepare("UPDATE auth_sessions SET revoked_at_utc = ? WHERE user_id = ? AND revoked_at_utc IS NULL").run(now, record.user_id);
    db.prepare("INSERT INTO auth_audit_events (user_id, event_type, outcome, ip_address, created_at_utc) VALUES (?, 'password_reset_completed', 'success', ?, ?)")
      .run(record.user_id, ip, now);
  })();
  return NextResponse.json({ message: "Your password has been reset successfully." });
}
