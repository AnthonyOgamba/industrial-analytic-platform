"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import type { SessionUser } from "@/lib/session-user";
import {
  createAccessChecks,
  requiredCapabilityForPath,
} from "@/lib/access-policy";

type AccessContextValue = {
  user?: SessionUser;
  loading: boolean;
  error: string;
  can: (capability: string) => boolean;
  canAny: (capabilities: string[]) => boolean;
  canAll: (capabilities: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasFacilityAccess: (facilityId: number) => boolean;
  canAccess: (permission: string, facilityId?: number) => boolean;
  refresh: () => Promise<SessionUser | undefined>;
  clear: () => void;
};

const AccessContext = createContext<AccessContextValue | null>(null);

async function fetchSession() {
  const response = await fetch("/api/auth/session", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (response.status === 401) return undefined;
  if (!response.ok) throw new Error("The authenticated session could not be loaded.");
  const payload = (await response.json()) as { user?: SessionUser };
  return payload.user;
}

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await fetchSession();
      setUser(next);
      return next;
    } catch (cause) {
      setUser(undefined);
      setError(cause instanceof Error ? cause.message : "The authenticated session could not be loaded.");
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchSession()
      .then((next) => {
        if (active) setUser(next);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "The authenticated session could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const refreshAuthorization = () => void refresh();
    window.addEventListener("divu-authorization-stale", refreshAuthorization);
    return () => window.removeEventListener("divu-authorization-stale", refreshAuthorization);
  }, [refresh]);

  const checks = useMemo(() => createAccessChecks(user), [user]);
  const value = useMemo<AccessContextValue>(() => ({
    user,
    loading,
    error,
    can: checks.can,
    canAny: checks.canAny,
    canAll: checks.canAll,
    hasPermission: checks.can,
    hasAnyPermission: checks.canAny,
    hasAllPermissions: checks.canAll,
    hasFacilityAccess: checks.hasFacilityAccess,
    canAccess: (permission, facilityId) => checks.can(permission) && (facilityId === undefined || checks.hasFacilityAccess(facilityId)),
    refresh,
    clear: () => setUser(undefined),
  }), [checks, error, loading, refresh, user]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export const AuthorizationProvider = AccessProvider;
export const useAuthorization = useAccess;

export function PermissionGate({ permission, anyOf, allOf, children }: {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  children: React.ReactNode;
}) {
  const access = useAccess();
  if (access.loading || !access.user) return null;
  const allowed = permission ? access.hasPermission(permission)
    : anyOf ? access.hasAnyPermission(anyOf)
      : allOf ? access.hasAllPermissions(allOf)
        : false;
  return allowed ? children : null;
}

export function useAccess() {
  const value = useContext(AccessContext);
  if (!value) throw new Error("useAccess must be used inside AccessProvider.");
  return value;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const access = useAccess();
  const required = requiredCapabilityForPath(pathname);

  useEffect(() => {
    if (access.loading) return;
    if (!access.user) {
      router.replace("/login?reason=authentication-required");
      return;
    }
    if (access.user.mustChangePassword) {
      router.replace("/change-password");
      return;
    }
    if (required && !access.can(required)) {
      router.replace(`/unauthorized?required=${encodeURIComponent(required)}`);
    }
  }, [access, required, router]);

  if (access.loading) {
    return <div role="status" className="m-6 h-64 animate-pulse rounded-xl bg-muted" aria-label="Loading access permissions" />;
  }
  if (!access.user || access.user.mustChangePassword || (required && !access.can(required))) {
    return null;
  }
  return children;
}
