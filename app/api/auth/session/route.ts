import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { AUTH_COOKIE, normalizeRole } from "@/lib/auth/constants";
import { requestBackend } from "@/lib/backend-api";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    const validation = await requestBackend<unknown>("/api/dashboard", { token });
    if (validation.response.status === 401) {
      const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
      response.cookies.delete(AUTH_COOKIE);
      return response;
    }
    if (!validation.response.ok) return NextResponse.json({ error: "Session validation service is unavailable." }, { status: 503 });
    const claims = decodeJwt(token);
    const uid = Number(claims.uid ?? claims.sub);
    const username = String(
      claims.username ??
      claims.unique_name ??
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      "",
    );
    const role = String(
      claims.role ??
      claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      "viewer",
    );
    if (!Number.isFinite(uid) || !username) throw new Error("Session claims missing");
    return NextResponse.json({
      user: { uid, username, email: typeof claims.email === "string" ? claims.email : "", role, displayRole: normalizeRole(role) },
    });
  } catch {
    return NextResponse.json({ error: "Session validation service is unavailable." }, { status: 503 });
  }
}
