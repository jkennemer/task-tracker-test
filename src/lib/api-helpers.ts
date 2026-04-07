import { NextResponse } from "next/server";

export async function requireAuth() {
  return { session: { user: { id: "anonymous" } }, error: null };
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
