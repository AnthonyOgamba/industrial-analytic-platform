import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { expireAuthentication, gatewayFailure, publicBackendResponse, requestBackend } from "@/lib/backend-api";
import type { CurrentUserDto } from "@/lib/backend-dtos";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    const result = await requestBackend<CurrentUserDto>("/api/auth/me", { token });
    const response = publicBackendResponse(result.body, result.response.status);
    return result.response.status === 401 ? expireAuthentication(response) : response;
  } catch (error) {
    return gatewayFailure(error);
  }
}
