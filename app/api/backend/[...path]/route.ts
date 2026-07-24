import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { backendUrl, expireAuthentication, gatewayFailure, publicBackendResponse, requestBackend } from "@/lib/backend-api";

type Context = { params: Promise<{ path: string[] }> };

const allowed = [
  { pattern: /^auth\/me$/, methods: ["GET"] },
  { pattern: /^profile$/, methods: ["GET", "PATCH"] },
  { pattern: /^settings\/organization$/, methods: ["GET", "PATCH"] },
  { pattern: /^users$/, methods: ["GET", "POST"] },
  { pattern: /^users\/\d+$/, methods: ["PATCH"] },
  { pattern: /^users\/\d+\/status$/, methods: ["PATCH"] },
  { pattern: /^users\/\d+\/invitation$/, methods: ["POST"] },
  { pattern: /^roles$/, methods: ["GET", "POST"] },
  { pattern: /^roles\/[^/]+$/, methods: ["PATCH", "DELETE"] },
  { pattern: /^dashboard(?:\/analytics)?$/, methods: ["GET"] },
  { pattern: /^runs$/, methods: ["GET", "POST"] },
  { pattern: /^runs\/(?:active|stations)$/, methods: ["GET"] },
  { pattern: /^runs\/(?:dashboard-summary|analytics)$/, methods: ["GET"] },
  { pattern: /^runs\/dashboard-workspace$/, methods: ["GET"] },
  { pattern: /^runs\/\d+\/close$/, methods: ["PATCH"] },
  { pattern: /^runs\/\d+\/(?:start|pause|fail)$/, methods: ["PATCH"] },
  { pattern: /^facilities$/, methods: ["GET", "POST"] },
  { pattern: /^facilities\/workspace$/, methods: ["GET"] },
  { pattern: /^facilities\/\d+\/halls$/, methods: ["GET", "POST"] },
  { pattern: /^halls\/\d+\/lines$/, methods: ["GET", "POST"] },
  { pattern: /^lines\/\d+\/stations$/, methods: ["GET", "POST"] },
  { pattern: /^site-access$/, methods: ["GET", "POST"] },
  { pattern: /^(?:facilities|halls|lines)\/\d+\/performance$/, methods: ["GET"] },
  { pattern: /^products$/, methods: ["GET", "POST"] },
  { pattern: /^products\/\d+$/, methods: ["GET", "PUT", "DELETE"] },
  { pattern: /^sensors\/streams$/, methods: ["GET", "POST"] },
  { pattern: /^sensors\/streams\/\d+$/, methods: ["GET", "PUT"] },
  { pattern: /^sensors\/streams\/\d+\/sensors$/, methods: ["GET"] },
  { pattern: /^sensors$/, methods: ["POST"] },
  { pattern: /^sensors\/\d+$/, methods: ["PUT"] },
  { pattern: /^sensors\/readings$/, methods: ["POST"] },
  { pattern: /^sensors\/runs\/\d+\/readings$/, methods: ["GET"] },
  { pattern: /^sensors\/analytics$/, methods: ["GET"] },
  { pattern: /^audit$/, methods: ["GET"] },
  { pattern: /^reports$/, methods: ["GET"] },
  { pattern: /^reports\/export\.xlsx$/, methods: ["GET"] },
  { pattern: /^downtime(?:\/\d+)?$/, methods: ["GET"] },
  { pattern: /^financial$/, methods: ["GET"] },
  { pattern: /^security-events(?:\/\d+)?$/, methods: ["GET"] },
  { pattern: /^activity$/, methods: ["GET"] },
  { pattern: /^data-governance$/, methods: ["GET", "POST"] },
  { pattern: /^data-governance\/[0-9a-fA-F-]+$/, methods: ["PATCH"] },
  { pattern: /^data-input\/batches$/, methods: ["GET"] },
  { pattern: /^data-input\/batches\/[0-9a-fA-F-]+$/, methods: ["GET"] },
  { pattern: /^data-input\/import$/, methods: ["POST"] },
  { pattern: /^generation-batches$/, methods: ["GET"] },
  { pattern: /^generation-batches\/[0-9a-fA-F-]+$/, methods: ["GET"] },
  { pattern: /^ai\/alerts$/, methods: ["GET"] },
  { pattern: /^ai\/alerts\/summary$/, methods: ["GET"] },
  { pattern: /^ai\/assets\/failure-probabilities$/, methods: ["GET"] },
  { pattern: /^ai\/assets\/[^/]+\/failure-probability$/, methods: ["GET"] },
  { pattern: /^ai\/notifications$/, methods: ["GET"] },
  { pattern: /^ai\/rules$/, methods: ["GET", "POST"] },
  { pattern: /^ai\/rules\/\d+$/, methods: ["PUT", "DELETE"] },
  { pattern: /^ai\/settings$/, methods: ["GET", "PUT"] },
  { pattern: /^ai\/chat$/, methods: ["POST"] },
  { pattern: /^ai\/(?:health|ready|openapi\.json)$/, methods: ["GET"] },
  { pattern: /^ai\/alerts\/\d+\/(?:acknowledge|resolve)$/, methods: ["POST"] },
  { pattern: /^ai\/notifications\/\d+\/read$/, methods: ["PATCH"] },
  { pattern: /^ai\/notifications\/mark-all-read$/, methods: ["POST"] },
  { pattern: /^ai\/agent\/run$/, methods: ["POST"] },
  { pattern: /^ai\/data-generators$/, methods: ["GET", "POST"] },
  { pattern: /^ai\/data-generators\/[0-9a-fA-F-]+$/, methods: ["GET"] },
  { pattern: /^ai\/data-generators\/[0-9a-fA-F-]+\/(?:readings|metrics)$/, methods: ["GET"] },
  { pattern: /^ai\/data-generators\/[0-9a-fA-F-]+\/(?:pause|resume|stop)$/, methods: ["POST"] },
] as const;

async function handler(request: NextRequest, context: Context) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const path = (await context.params).path.join("/");
  const method = request.method.toUpperCase();
  if (!allowed.some((entry) => entry.pattern.test(path) && entry.methods.includes(method as never))) {
    return NextResponse.json({ error: "This backend operation is not available." }, { status: 404 });
  }
  const query = request.nextUrl.search;
  try {
    if (path === "reports/export.xlsx") {
      const upstream = await fetch(backendUrl(`/api/${path}${query}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        cache: "no-store",
        signal: request.signal,
      });
      if (upstream.status === 401) {
        return expireAuthentication(NextResponse.json({ error: "Your session has expired." }, { status: 401 }));
      }
      if (!upstream.ok) {
        const errorBody = upstream.headers.get("content-type")?.includes("application/json")
          ? await upstream.json().catch(() => null)
          : null;
        return publicBackendResponse(errorBody, upstream.status);
      }
      const headers = new Headers({
        "Content-Type": upstream.headers.get("content-type") || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const disposition = upstream.headers.get("content-disposition");
      if (disposition) headers.set("Content-Disposition", disposition);
      return new NextResponse(upstream.body, { status: upstream.status, headers });
    }
    const contentType = request.headers.get("content-type") || "";
    const hasBody = method !== "GET" && method !== "DELETE";
    const body = hasBody
      ? contentType.startsWith("multipart/form-data")
        ? await request.arrayBuffer()
        : await request.text()
      : undefined;
    const result = await requestBackend(`/api/${path}${query}`, {
      method,
      token,
      body: body || undefined,
      contentType: contentType.startsWith("multipart/form-data") ? contentType : undefined,
    });
    const response = publicBackendResponse(result.body, result.response.status);
    return result.response.status === 401 ? expireAuthentication(response) : response;
  } catch (error) {
    return gatewayFailure(error);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
