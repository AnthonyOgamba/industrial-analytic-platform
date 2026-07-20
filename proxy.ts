import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPages = ["/login", "/signin", "/forgot-password", "/reset-password"];

async function authenticated(request: NextRequest) {
  const token = request.cookies.get("divu_access_token")?.value;
  if (!token) return false;
  try {
    const configuredKey = process.env.JWT_SIGNING_KEY;
    if (!configuredKey && process.env.NODE_ENV === "production") return false;
    const key = new TextEncoder().encode(configuredKey || "development-only-divu-signing-key-change-me");
    await jwtVerify(token, key, {
      issuer: process.env.JWT_ISSUER || "divu-analytics",
      audience: process.env.JWT_AUDIENCE || "divu-web",
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const isPublic = publicPages.includes(request.nextUrl.pathname);
  const isAuthenticated = await authenticated(request);
  if (isPublic && isAuthenticated) return NextResponse.redirect(new URL("/", request.url));
  if (!isPublic && !isAuthenticated) {
    const login = new URL("/login", request.url);
    login.searchParams.set("reason", "authentication-required");
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
