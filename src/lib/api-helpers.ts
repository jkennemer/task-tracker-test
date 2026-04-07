import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      session: null as never,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
