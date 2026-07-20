import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { getDatabase } from "@/lib/auth/database";
import { hashSecret, verifyToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  const bearer = request.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : request.cookies.get(AUTH_COOKIE)?.value;
  if (token) {
    try {
      const claims = await verifyToken(token);
      getDatabase().prepare("UPDATE auth_sessions SET revoked_at_utc = ? WHERE jwt_id_hash = ?")
        .run(new Date().toISOString(), hashSecret(claims.jti));
    } catch {}
  }
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
