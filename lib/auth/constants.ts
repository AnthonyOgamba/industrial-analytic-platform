export const AUTH_COOKIE = "divu_access_token";
export const AUTH_MAX_AGE_SECONDS = Number(process.env.JWT_EXPIRY_SECONDS || 8 * 60 * 60);

export function normalizeRole(role: string) {
  if (role === "super_admin" || role === "admin") return "Administrator";
  if (role === "manager") return "Plant Manager";
  return "Viewer";
}
