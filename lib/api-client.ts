"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export class ApiTimeoutError extends ApiError {
  constructor(public timeoutMs: number) {
    super(`The request timed out after ${Math.round(timeoutMs / 1000)} seconds.`, 408);
  }
}

export class ApiCancelledError extends ApiError {
  constructor() {
    super("The request was cancelled.", 499);
  }
}

export type ApiRequestInit = RequestInit & { timeoutMs?: number };
export const DEFAULT_API_TIMEOUT_MS = 45_000;

export async function apiRequest<T>(url: string, init: ApiRequestInit = {}): Promise<T> {
  const { timeoutMs = DEFAULT_API_TIMEOUT_MS, signal: callerSignal, ...requestInit } = init;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = callerSignal ? AbortSignal.any([callerSignal, timeoutSignal]) : timeoutSignal;
  const isFormData = typeof FormData !== "undefined" && requestInit.body instanceof FormData;
  try {
    const response = await fetch(url, {
      ...requestInit,
      signal,
      credentials: "same-origin",
      headers: {
        ...(requestInit.body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...requestInit.headers,
      },
    });
    if (response.status === 204) return undefined as T;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const fallback = response.status === 400
        ? "The request contains invalid values."
        : response.status === 401
          ? "Your session has expired."
          : response.status === 403
            ? "You do not have permission to perform this action."
        : response.status === 404
          ? "This feature or resource is unavailable."
          : response.status === 409
            ? "The action conflicts with the current resource state."
            : response.status === 503
              ? "The requested backend service is temporarily unavailable."
              : response.status === 504
                ? "The backend request timed out. Please try again."
                : response.status >= 500
                  ? "The server could not complete the request."
                  : "The request could not be completed.";
      const message = typeof data.error === "string" && !data.error.trimStart().startsWith("<") ? data.error : fallback;
      if (response.status === 401 && url !== "/api/auth/login") {
        window.dispatchEvent(new Event("divu-session-expired"));
        window.location.assign("/login?reason=session-expired");
      }
      throw new ApiError(message, response.status);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timeoutSignal.aborted && !callerSignal?.aborted) throw new ApiTimeoutError(timeoutMs);
    if (callerSignal?.aborted) throw new ApiCancelledError();
    throw new ApiError("Unable to reach DIVU Analytics. Check your connection and try again.", 0);
  }
}
