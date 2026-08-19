import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { expireAuthentication, gatewayFailure, isAuthenticationInvalid, publicBackendResponse, requestBackend } from "@/lib/backend-api";

/**
 * BFF: Canonical backend proxy
 * ENDPOINT: /api/backend/{path} forwards only allow-listed routes and methods.
 * SESSION: The secure cookie is read server-side and is never exposed to browser code.
 * SECURITY: Allow-listing prevents an unrestricted gateway tunnel.
 */

type Context = { params: Promise<{ path: string[] }> };

const allowed = [
  // BFF: Same-origin gateway readiness; the browser never calls Container App URLs directly.
  { pattern: /^ready$/, methods: ["GET"] },
  // BFF: Bounded page-oriented read models. Mutations continue through their domain routes.
  { pattern: /^page\/(?:dashboard|profile|facilities|assets|sensors|downtime|users|users\/roles|reports|governance|audit|olive|api-gateway)$/, methods: ["GET"] },
  { pattern: /^dashboard(?:\/analytics)?$/, methods: ["GET"] },
  { pattern: /^runs$/, methods: ["GET", "POST"] },
  { pattern: /^runs\/(?:active|stations)$/, methods: ["GET"] },
  { pattern: /^runs\/(?:dashboard-summary|analytics)$/, methods: ["GET"] },
  { pattern: /^runs\/\d+\/close$/, methods: ["PATCH"] },
  { pattern: /^runs\/\d+\/(?:start|pause|fail)$/, methods: ["PATCH"] },
  { pattern: /^facilities$/, methods: ["GET", "POST"] },
  { pattern: /^facilities\/workspace$/, methods: ["GET"] },
  { pattern: /^facilities\/\d+$/, methods: ["GET", "PATCH"] },
  { pattern: /^facilities\/\d+\/access$/, methods: ["GET", "POST"] },
  { pattern: /^facilities\/\d+\/access\/\d+$/, methods: ["PATCH", "DELETE"] },
  { pattern: /^facilities\/\d+\/financial-configuration$/, methods: ["GET", "PATCH"] },
  { pattern: /^facilities\/\d+\/halls$/, methods: ["GET", "POST"] },
  { pattern: /^halls\/\d+$/, methods: ["PATCH"] },
  { pattern: /^halls\/\d+\/lines$/, methods: ["GET", "POST"] },
  { pattern: /^lines\/\d+$/, methods: ["PATCH"] },
  { pattern: /^lines\/\d+\/stations$/, methods: ["GET", "POST"] },
  { pattern: /^stations\/\d+$/, methods: ["PATCH"] },
  { pattern: /^site-access$/, methods: ["GET", "POST"] },
  { pattern: /^(?:facilities|halls|lines)\/\d+\/performance$/, methods: ["GET"] },
  { pattern: /^products$/, methods: ["GET", "POST"] },
  { pattern: /^products\/\d+$/, methods: ["GET", "PUT", "DELETE"] },
  { pattern: /^assets$/, methods: ["GET", "POST"] },
  { pattern: /^assets\/\d+$/, methods: ["PUT", "DELETE"] },
  { pattern: /^sensors\/catalog$/, methods: ["GET", "POST"] },
  { pattern: /^sensors\/catalog\/\d+$/, methods: ["GET", "PATCH", "DELETE"] },
  { pattern: /^sensors\/streams$/, methods: ["GET", "POST"] },
  { pattern: /^sensors\/streams\/\d+$/, methods: ["GET", "PUT"] },
  { pattern: /^sensors\/streams\/\d+\/sensors$/, methods: ["GET"] },
  { pattern: /^sensors$/, methods: ["POST"] },
  { pattern: /^sensors\/\d+$/, methods: ["PUT"] },
  { pattern: /^sensors\/readings$/, methods: ["POST"] },
  { pattern: /^sensors\/runs\/\d+\/readings$/, methods: ["GET"] },
  { pattern: /^sensors\/analytics$/, methods: ["GET"] },
  { pattern: /^audit$/, methods: ["GET"] },
  { pattern: /^reports$/, methods: ["GET", "POST"] },
  { pattern: /^activity$/, methods: ["GET"] },
  { pattern: /^financial$/, methods: ["GET"] },
  { pattern: /^financial\/(?:summary|monthly|facilities|lines)$/, methods: ["GET"] },
  { pattern: /^downtime$/, methods: ["GET"] },
  { pattern: /^downtime\/\d+$/, methods: ["GET"] },
  { pattern: /^downtime\/events$/, methods: ["GET", "POST"] },
  { pattern: /^downtime\/events\/\d+$/, methods: ["PUT", "DELETE"] },
  { pattern: /^downtime\/events\/\d+\/repair$/, methods: ["PATCH"] },
  { pattern: /^notifications$/, methods: ["GET", "POST"] },
  { pattern: /^notifications\/\d+\/read$/, methods: ["PATCH"] },
  { pattern: /^notifications\/read-all$/, methods: ["POST"] },
  { pattern: /^approvals$/, methods: ["GET", "POST"] },
  { pattern: /^approvals\/[0-9a-fA-F-]+\/decision$/, methods: ["POST"] },
  { pattern: /^security-events$/, methods: ["GET"] },
  { pattern: /^security-events\/\d+$/, methods: ["GET"] },
  { pattern: /^users$/, methods: ["GET", "POST"] },
  { pattern: /^users\/\d+$/, methods: ["PATCH"] },
  { pattern: /^users\/\d+\/roles$/, methods: ["PUT"] },
  { pattern: /^users\/\d+\/roles$/, methods: ["GET"] },
  { pattern: /^users\/\d+\/effective-permissions$/, methods: ["GET"] },
  { pattern: /^users\/\d+\/(?:status|invitation)$/, methods: ["PATCH", "POST"] },
  { pattern: /^users\/\d+\/temporary-passcode\/regenerate$/, methods: ["POST"] },
  { pattern: /^users\/\d+\/permanent-deletion$/, methods: ["POST"] },
  { pattern: /^users\/permanent-deletions\/[0-9a-fA-F-]+\/decision$/, methods: ["POST"] },
  { pattern: /^roles$/, methods: ["GET", "POST"] },
  { pattern: /^roles\/[^/]+$/, methods: ["PATCH", "DELETE"] },
  { pattern: /^permissions$/, methods: ["GET"] },
  { pattern: /^permissions\/grouped$/, methods: ["GET"] },
  { pattern: /^roles\/[^/]+\/permissions$/, methods: ["GET", "PUT"] },
  { pattern: /^profile$/, methods: ["GET", "PATCH"] },
  { pattern: /^settings\/organization$/, methods: ["GET", "PATCH"] },
  { pattern: /^data-input\/batches$/, methods: ["GET"] },
  { pattern: /^data-input\/batches\/[0-9a-fA-F-]+$/, methods: ["GET"] },
  { pattern: /^data-input\/import$/, methods: ["POST"] },
  { pattern: /^generation-batches$/, methods: ["GET"] },
  { pattern: /^generation-batches\/[0-9a-fA-F-]+$/, methods: ["GET"] },
  { pattern: /^data-governance$/, methods: ["GET", "POST"] },
  { pattern: /^data-governance\/[0-9a-fA-F-]+$/, methods: ["PATCH", "DELETE"] },
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
  { pattern: /^ai\/data-generators\/[0-9a-fA-F-]+$/, methods: ["GET", "DELETE"] },
  { pattern: /^ai\/data-generators\/[0-9a-fA-F-]+\/data$/, methods: ["DELETE"] },
  { pattern: /^ai\/generation-batches\/[0-9a-fA-F-]+$/, methods: ["DELETE"] },
  { pattern: /^ai\/generated-data\/deletion-requests$/, methods: ["POST"] },
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
  const requestBody = method === "GET" ? "" : await request.text();
  const body = requestBody || undefined;
  try {
    // ENDPOINT: Gateway readiness is rooted at /ready; application APIs remain under /api.
    const backendPath = path === "ready" ? `/ready${query}` : `/api/${path}${query}`;
    const result = await requestBackend(backendPath, { method, token, body });
    const response = publicBackendResponse(result.body, result.response.status);
    if (result.response.status !== 401) return response;
    return await isAuthenticationInvalid(token) ? expireAuthentication(response) : response;
  } catch (error) {
    return gatewayFailure(error);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
