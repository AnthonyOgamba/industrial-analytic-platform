export const AUTH_COOKIE = "divu_access_token";
export const AUTH_MAX_AGE_SECONDS = Number(process.env.JWT_EXPIRY_SECONDS || 8 * 60 * 60);
export const RESET_TOKEN_TTL_MINUTES = 30;
export const GENERIC_RESET_MESSAGE =
  "If an account with that username or email exists, password reset instructions have been sent.";

export function normalizeRole(role: string) {
  if (role === "super_admin" || role === "admin") return "Administrator";
  if (role === "manager") return "Plant Manager";
  return "Viewer";
}
