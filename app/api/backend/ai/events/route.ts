import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { backendUrl, expireAuthentication, gatewayFailure, isAuthenticationInvalid } from "@/lib/backend-api";

/**
 * BFF: Olive event stream
 * ENDPOINT: GET /api/backend/ai/events proxies authenticated server-sent events.
 * SESSION: A stream 401 expires authentication only after identity validation confirms it.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const headers = new Headers({ Authorization: `Bearer ${token}`, Accept: "text/event-stream" });
    const lastEventId = request.headers.get("last-event-id");
    if (lastEventId) headers.set("Last-Event-ID", lastEventId);
    const upstream = await fetch(backendUrl("/api/ai/events"), { headers, cache: "no-store", signal: request.signal });
    if (!upstream.ok || !upstream.body) {
      const response = NextResponse.json({ error: upstream.status === 503 ? "Olive live updates are disabled." : "Olive live updates are unavailable." }, { status: upstream.status });
      if (upstream.status !== 401) return response;
      return await isAuthenticationInvalid(token) ? expireAuthentication(response) : response;
    }
    return new Response(upstream.body, { status: 200, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    return gatewayFailure(error);
  }
}
