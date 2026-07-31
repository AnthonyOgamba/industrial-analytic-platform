import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, normalizeRole } from "@/lib/auth/constants";
import { requestBackend } from "@/lib/backend-api";

type CurrentUser = {
  uid: number;
  username: string;
  email: string;
  role: string;
  roles?: string[];
  capabilities: string[];
  facilityIds: number[];
  mustChangePassword: boolean;
};
type AuthorizationContext = {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
  facilityAccess: number[];
  permissionVersion: number;
  accountStatus: string;
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    const [validation, authorization] = await Promise.all([
      requestBackend<CurrentUser>("/api/auth/me", { token }),
      requestBackend<AuthorizationContext>("/api/auth/me/authorization-context", { token }),
    ]);
    if (validation.response.status === 401) {
      const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
      response.cookies.delete(AUTH_COOKIE);
      return response;
    }
    const user = validation.body;
    const context = authorization.body;
    if (!validation.response.ok || !user || !Number.isFinite(user.uid) || !user.username) {
      return NextResponse.json(
        { error: "Session validation is unavailable." },
        { status: validation.response.status === 403 ? 403 : 503 },
      );
    }
    if ((!authorization.response.ok || !context) && !user.mustChangePassword) {
      return NextResponse.json(
        { error: "Authorization context is unavailable." },
        { status: authorization.response.status === 401 || authorization.response.status === 403 ? 403 : 503 },
      );
    }
    const roles = context?.roles ?? user.roles ?? [user.role];
    const permissions = context?.permissions ?? user.capabilities ?? [];
    const facilityAccess = context?.facilityAccess ?? user.facilityIds ?? [];
    const permissionVersion = context && Number.isInteger(context.permissionVersion)
      ? context.permissionVersion
      : 0;
    const accountStatus = context && typeof context.accountStatus === "string"
      ? context.accountStatus
      : "active";
    return NextResponse.json({
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        role: user.role,
        roles: Array.isArray(roles) ? roles.filter((role): role is string => typeof role === "string") : [],
        displayRole: normalizeRole(user.role),
        capabilities: Array.isArray(permissions)
          ? [...new Set(permissions.filter((permission): permission is string => typeof permission === "string").map((permission) => permission.trim().toLowerCase()))]
          : [],
        permissions: Array.isArray(permissions)
          ? [...new Set(permissions.filter((permission): permission is string => typeof permission === "string").map((permission) => permission.trim().toLowerCase()))]
          : [],
        facilityIds: Array.isArray(facilityAccess)
          ? facilityAccess.filter((facilityId): facilityId is number => Number.isInteger(facilityId))
          : [],
        permissionVersion,
        accountStatus,
        mustChangePassword: user.mustChangePassword === true,
      },
    });
  } catch {
    return NextResponse.json({ error: "Session validation service is unavailable." }, { status: 503 });
  }
}
