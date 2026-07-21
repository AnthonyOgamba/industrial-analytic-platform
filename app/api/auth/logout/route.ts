import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";

export async function POST() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
