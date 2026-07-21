import { NextResponse } from "next/server";

const message = "Password reset completion is not yet available in the DIVU backend.";

export async function GET() {
  return NextResponse.json({ error: message }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: message }, { status: 501 });
}
