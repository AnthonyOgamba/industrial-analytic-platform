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
import { timedRequest } from "@/lib/request-timing";
import {
  createAccessChecks,
  requiredCapabilityForPath,
  requiresFacilityScopeForPath,
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
  const payload = (await response.json().catch(() => ({}))) as { user?: SessionUser; error?:string };
  if (!response.ok) {
    throw new Error(payload.error || (response.status === 403
      ? "Your authorization context is unavailable."
      : "The authorization service is temporarily unavailable."));
  }
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
      setError(cause instanceof Error ? cause.message : "The authenticated session could not be loaded.");
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    timedRequest("session bootstrap / authorization context", fetchSession)
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
    if (access.error && !access.user) return;
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

  if (access.loading && !access.user) {
    return <div role="status" className="m-6 h-64 animate-pulse rounded-xl bg-muted" aria-label="Loading access permissions" />;
  }
  if (access.error && !access.user) {
    return <div role="alert" className="m-6 rounded-xl border border-destructive/30 bg-destructive/10 p-5"><h1 className="font-semibold">Authorization unavailable</h1><p className="mt-1 text-sm text-muted-foreground">{access.error}</p><button type="button" onClick={()=>void access.refresh()} className="mt-4 h-9 rounded-lg border bg-card px-3 text-xs font-semibold">Retry</button></div>;
  }
  if (!access.user || access.user.mustChangePassword || (required && !access.can(required))) {
    return null;
  }
  const lacksFacilityScope = requiresFacilityScopeForPath(pathname)
    && !access.can("facilities.access.global")
    && access.user.facilityIds.length === 0;
  if (lacksFacilityScope) {
    return <div role="status" className="m-6 rounded-xl border bg-card p-6"><h1 className="font-semibold">No facility access assigned</h1><p className="mt-1 text-sm text-muted-foreground">Your account can open this page, but it is not assigned to a facility. Ask an administrator to assign facility access.</p><button type="button" onClick={()=>void access.refresh()} className="mt-4 h-9 rounded-lg border px-3 text-xs font-semibold">Retry access check</button></div>;
  }
  if (access.error) {
    return <><div role="alert" className="m-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs"><strong>Authorization refresh delayed.</strong> {access.error} <button type="button" onClick={()=>void access.refresh()} className="ml-2 rounded border px-2 py-1 font-semibold">Retry</button></div>{children}</>;
  }
  return children;
}
