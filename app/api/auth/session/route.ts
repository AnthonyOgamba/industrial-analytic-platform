import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, normalizeRole } from "@/lib/auth/constants";
import { getDatabase } from "@/lib/auth/database";
import { hashSecret, verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  const bearer = request.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    const claims = await verifyToken(token);
    const session = getDatabase()
      .prepare("SELECT id FROM auth_sessions WHERE jwt_id_hash = ? AND revoked_at_utc IS NULL AND expires_at_utc > ?")
      .get(hashSecret(claims.jti), new Date().toISOString());
    if (!session) throw new Error("Session revoked");
    return NextResponse.json({
      user: { uid: claims.uid, username: claims.username, role: claims.role, displayRole: normalizeRole(claims.role) },
    });
  } catch {
    const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }
}
