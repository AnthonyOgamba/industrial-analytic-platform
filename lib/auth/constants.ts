export const AUTH_COOKIE = "divu_access_token";
export const AUTH_MAX_AGE_SECONDS = Number(process.env.JWT_EXPIRY_SECONDS || 8 * 60 * 60);

/**
 * FEATURE: Canonical role display
 * SECURITY: Authorization continues to use backend role keys and permission claims; labels are presentation only.
 */
export const ROLE_LABELS: Readonly<Record<string, string>> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  platform_manager: "Platform Manager",
  operations_manager: "Operations Manager",
  plant_manager: "Plant Manager",
  manager: "Manager",
  maintenance_manager: "Maintenance Manager",
  maintenance_technician: "Maintenance Technician",
  line_supervisor: "Line Supervisor",
  data_manager: "Data Manager",
  security_admin: "Security Administrator",
  security_analyst: "Security Analyst",
  viewer: "Viewer",
};

export function normalizeRole(role: string) {
  const key = role.trim().toLowerCase();
  if (ROLE_LABELS[key]) return ROLE_LABELS[key];
  return key
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ") || "Authenticated User";
}
