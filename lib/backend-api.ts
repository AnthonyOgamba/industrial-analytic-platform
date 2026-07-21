import "server-only";

import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";

const DEVELOPMENT_BACKEND_URL = "http://localhost:8080";
const REQUEST_TIMEOUT_MS = 10_000;

export function backendBaseUrl() {
  const configured = process.env.BACKEND_API_URL?.trim();
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("BACKEND_API_URL is required in production.");
  }
  return (configured || DEVELOPMENT_BACKEND_URL).replace(/\/+$/, "");
}

export function backendUrl(path: string) {
  return `${backendBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export type BackendResult<T> = {
  response: Response;
  body: T | null;
};

export async function readBackendBody<T>(response: Response): Promise<T | null> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json().catch(() => null) as Promise<T | null>;
  const text = await response.text().catch(() => "");
  return (text ? ({ error: text } as T) : null);
}

export function backendError(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "error" in body) {
    const error = (body as { error?: unknown }).error;
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }
  return fallback;
}

export async function requestBackend<T>(
  path: string,
  options: { method?: string; token?: string; body?: string; signal?: AbortSignal } = {},
): Promise<BackendResult<T>> {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal;
  const headers = new Headers();
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(backendUrl(path), {
    method: options.method || "GET",
    headers,
    body: options.body,
    cache: "no-store",
    signal,
  });
  return { response, body: await readBackendBody<T>(response) };
}

export function gatewayFailure(error: unknown) {
  const timeout = error instanceof DOMException && error.name === "TimeoutError";
  return NextResponse.json(
    { error: timeout ? "The DIVU backend timed out. Please try again." : "The DIVU backend is unavailable." },
    { status: 503 },
  );
}

export function publicBackendResponse(body: unknown, status: number) {
  if (status === 204) return new NextResponse(null, { status: 204 });
  if (status >= 200 && status < 300) {
    if (body === null) return NextResponse.json({ error: "The backend returned an invalid response." }, { status: 502 });
    return NextResponse.json(body, { status });
  }
  return NextResponse.json(
    { error: backendError(body, status === 401 ? "Your session has expired." : "The backend could not complete the request.") },
    { status },
  );
}

export function expireAuthentication(response: NextResponse) {
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
