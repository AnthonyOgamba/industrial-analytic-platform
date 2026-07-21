import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { backendError, gatewayFailure, requestBackend } from "@/lib/backend-api";

export const runtime = "nodejs";
const schema = z.object({ identifier: z.string().trim().min(1).max(254) });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address or username." }, { status: 400 });
  try {
    const { response, body } = await requestBackend<{ message?: string; error?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ identifier: parsed.data.identifier.trim().toLowerCase() }),
    });
    if (!response.ok) return NextResponse.json({ error: backendError(body, "Password recovery could not be requested.") }, { status: response.status });
    if (!body?.message) return NextResponse.json({ error: "Password recovery returned an invalid response." }, { status: 502 });
    return NextResponse.json({ message: body.message });
  } catch (error) {
    return gatewayFailure(error);
  }
}
