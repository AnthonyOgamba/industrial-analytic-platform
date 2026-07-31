import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth/constants";
import { backendError, backendUrl, expireAuthentication, gatewayFailure, isAuthenticationInvalid, readBackendBody } from "@/lib/backend-api";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const upstream = await fetch(backendUrl(`/api/reports/export.xlsx${request.nextUrl.search}`), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });

    if (!upstream.ok) {
      const body = await readBackendBody(upstream);
      const response = NextResponse.json(
        { error: backendError(body, "The report export could not be generated.") },
        { status: upstream.status },
      );
      if (upstream.status !== 401) return response;
      return await isAuthenticationInvalid(token) ? expireAuthentication(response) : response;
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": upstream.headers.get("content-disposition") || 'attachment; filename="divu-industrial-analytics.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return gatewayFailure(error);
  }
}
