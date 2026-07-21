import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPages = ["/login", "/signin", "/forgot-password", "/reset-password"];

async function authenticated(request: NextRequest): Promise<boolean | null> {
  const token = request.cookies.get("divu_access_token")?.value;
  if (!token) return false;
  try {
    const base = (process.env.BACKEND_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8080" : "")).replace(/\/+$/, "");
    if (!base) return false;
    const response = await fetch(`${base}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) return true;
    if (response.status === 401) return false;
    return null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const isPublic = publicPages.includes(request.nextUrl.pathname);
  const isAuthenticated = await authenticated(request);
  if (isPublic && isAuthenticated) return NextResponse.redirect(new URL("/", request.url));
  if (!isPublic && isAuthenticated === false) {
    const login = new URL("/login", request.url);
    login.searchParams.set("reason", "authentication-required");
    const response = NextResponse.redirect(login);
    response.cookies.delete("divu_access_token");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
