import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}
