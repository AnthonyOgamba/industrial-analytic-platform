export type AccessClaims = {
  capabilities?: string[];
  facilityIds?: number[];
};

export const routeCapabilities: Array<{
  matches: (pathname: string) => boolean;
  capability: string;
}> = [
  { matches: (path) => path === "/", capability: "dashboard.view" },
  { matches: (path) => path.startsWith("/operations"), capability: "facilities.view" },
  { matches: (path) => path.startsWith("/assets"), capability: "assets.view" },
  { matches: (path) => path.startsWith("/sensors"), capability: "sensors.view" },
  { matches: (path) => path.startsWith("/downtime"), capability: "downtime.view" },
  { matches: (path) => path.startsWith("/reports"), capability: "reports.view" },
  { matches: (path) => path.startsWith("/local-ai"), capability: "olive.use" },
  { matches: (path) => path.startsWith("/governance"), capability: "governance.view" },
  { matches: (path) => path.startsWith("/security-ops"), capability: "security.view" },
  { matches: (path) => path.startsWith("/api-security"), capability: "api_security.view" },
  { matches: (path) => path.startsWith("/audit"), capability: "audit.view" },
  { matches: (path) => path.startsWith("/activity"), capability: "activity.view" },
  { matches: (path) => path.startsWith("/users"), capability: "users.view" },
  { matches: (path) => path.startsWith("/roles"), capability: "roles.view" },
  { matches: (path) => path.startsWith("/permissions"), capability: "roles.view" },
  { matches: (path) => path.startsWith("/access-management"), capability: "users.view" },
  { matches: (path) => path.startsWith("/access-assignments"), capability: "users.view" },
  { matches: (path) => path.startsWith("/access-requests"), capability: "users.view" },
  { matches: (path) => path.startsWith("/data-input"), capability: "generator.use" },
  { matches: (path) => path.startsWith("/profile"), capability: "settings.personal" },
  { matches: (path) => path.startsWith("/settings"), capability: "settings.personal" },
];

export function createAccessChecks(claims?: AccessClaims) {
  const capabilities = new Set((claims?.capabilities ?? []).map((capability) => capability.trim().toLowerCase()));
  const facilityIds = new Set(claims?.facilityIds ?? []);
  return {
    can: (capability: string) => capabilities.has(capability),
    canAny: (required: string[]) => required.some((capability) => capabilities.has(capability)),
    canAll: (required: string[]) => required.every((capability) => capabilities.has(capability)),
    hasFacilityAccess: (facilityId: number) => capabilities.has("facilities.access.global") || facilityIds.has(facilityId),
  };
}

export function requiredCapabilityForPath(pathname: string) {
  return routeCapabilities.find((entry) => entry.matches(pathname))?.capability;
}

export function requiresFacilityScopeForPath(pathname: string) {
  return pathname === "/"
    || pathname.startsWith("/operations")
    || pathname.startsWith("/assets")
    || pathname.startsWith("/sensors")
    || pathname.startsWith("/downtime")
    || pathname.startsWith("/reports")
    || pathname.startsWith("/local-ai");
}
