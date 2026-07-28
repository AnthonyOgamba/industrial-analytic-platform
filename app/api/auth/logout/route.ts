import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { backendError, requestBackend } from "@/lib/backend-api";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(AUTH_COOKIE);
  if (!token) return response;
  try {
    const backend = await requestBackend("/api/auth/logout", { method: "POST", token });
    if (backend.response.ok || backend.response.status === 401) return response;
    const failure = NextResponse.json(
      { error: backendError(backend.body, "The backend could not complete logout.") },
      { status: backend.response.status },
    );
    failure.cookies.delete(AUTH_COOKIE);
    return failure;
  } catch {
    const failure = NextResponse.json(
      { error: "The DIVU backend is unavailable." },
      { status: 503 },
    );
    failure.cookies.delete(AUTH_COOKIE);
    return failure;
  }
}
