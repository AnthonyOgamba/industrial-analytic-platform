export const AUTH_COOKIE = "divu_access_token";
export const AUTH_MAX_AGE_SECONDS = Number(process.env.JWT_EXPIRY_SECONDS || 8 * 60 * 60);

export function normalizeRole(role: string) {
  if (role === "super_admin" || role === "admin") return "Administrator";
  if (role === "platform_manager") return "Platform Manager";
  if (role === "operations_manager") return "Operations Manager";
  if (role === "data_manager") return "Data Manager";
  if (role === "manager") return "Plant Manager";
  if (role === "viewer") return "Viewer";
  return role
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ") || "Authenticated User";
}
