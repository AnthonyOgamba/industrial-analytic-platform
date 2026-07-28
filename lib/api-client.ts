"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  try {
    const request = () => fetch(url, {
      ...init,
      credentials: "same-origin",
      headers: {
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    let response = await request();
    if (response.status === 401 && url !== "/api/auth/login" && url !== "/api/auth/session") {
      window.dispatchEvent(new Event("divu-authorization-stale"));
      const session = await fetch("/api/auth/session", { credentials:"same-origin", cache:"no-store" });
      const method = (init.method ?? "GET").toUpperCase();
      if (session.ok && (method === "GET" || method === "HEAD")) response = await request();
      if (!session.ok || response.status === 401) {
        window.dispatchEvent(new Event("divu-session-expired"));
        window.location.assign("/login?reason=authorization-changed");
      }
    }
    if (response.status === 204) return undefined as T;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const fallback = response.status === 403
        ? "You do not have permission to perform this action."
        : response.status === 404
          ? "This feature or resource is unavailable."
          : response.status === 409
            ? "The action conflicts with the current resource state."
            : response.status === 503
              ? "Olive is temporarily unavailable. Please try again shortly."
              : response.status >= 500
                ? "The server could not complete the request."
                : "The request could not be completed.";
      const message = typeof data.error === "string" && !data.error.trimStart().startsWith("<") ? data.error : fallback;
      throw new ApiError(message, response.status);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unable to reach DIVU Analytics. Check your connection and try again.", 0);
  }
}
