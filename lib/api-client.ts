"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      ...init,
      credentials: "same-origin",
      headers: {
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    if (response.status === 204) return undefined as T;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        data.error ||
        (response.status === 404
          ? "The requested service is not available."
          : response.status >= 500
            ? "The server could not complete the request."
            : "The request could not be completed.");
      if (response.status === 401 && url !== "/api/auth/login") {
        window.dispatchEvent(new Event("divu-session-expired"));
        window.location.assign("/login?reason=session-expired");
      }
      throw new ApiError(message, response.status);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unable to reach DIVU Analytics. Check your connection and try again.", 0);
  }
}
