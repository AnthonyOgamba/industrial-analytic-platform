import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, normalizeRole } from "@/lib/auth/constants";
import { requestBackend } from "@/lib/backend-api";

type CurrentUser = {
  uid: number;
  username: string;
  email: string;
  role: string;
  capabilities: string[];
  facilityIds: number[];
  mustChangePassword: boolean;
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    const validation = await requestBackend<CurrentUser>("/api/auth/me", { token });
    if (validation.response.status === 401) {
      const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
      response.cookies.delete(AUTH_COOKIE);
      return response;
    }
    if (!validation.response.ok) return NextResponse.json({ error: "Session validation service is unavailable." }, { status: 503 });
    const user = validation.body;
    if (!user || !Number.isFinite(user.uid) || !user.username) throw new Error("Session response missing");
    return NextResponse.json({
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        role: user.role,
        displayRole: normalizeRole(user.role),
        capabilities: user.capabilities,
        facilityIds: user.facilityIds,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch {
    return NextResponse.json({ error: "Session validation service is unavailable." }, { status: 503 });
  }
}
