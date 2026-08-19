export type FieldErrors = Record<string, string>;

export function validationErrors(body: unknown): FieldErrors {
  if (!body || typeof body !== "object") return {};
  const candidate = (body as { errors?: unknown }).errors;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return {};
  const result: FieldErrors = {};
  for (const [key, value] of Object.entries(candidate as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) result[key] = value;
    else if (Array.isArray(value)) {
      const messages = value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
      if (messages.length) result[key] = messages.join(" ");
    }
  }
  return result;
}

export function responseErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const record = body as Record<string, unknown>;
  for (const key of ["error", "message", "detail"] as const) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (value && typeof value === "object") {
      const nested = (value as Record<string, unknown>).message;
      if (typeof nested === "string" && nested.trim()) return nested;
    }
  }
  return Object.values(validationErrors(body))[0] ?? fallback;
}
