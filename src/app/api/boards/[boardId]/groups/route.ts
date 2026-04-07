import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId } = await params;
  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { visibility: true, ownerId: true } });
  if (!board) return errorResponse("Board not found", 404);
  if (board.visibility !== "SHARED" && board.ownerId !== session.user.id) return errorResponse("Forbidden", 403);

  const body = await req.json();
  const { title, color } = body;
  if (!title?.trim()) return errorResponse("Title is required");

  const lastGroup = await prisma.group.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const group = await prisma.group.create({
    data: {
      boardId,
      title: title.trim(),
      color: color || "#0ea5e9",
      position: (lastGroup?.position ?? 0) + 1,
    },
  });

  return NextResponse.json(group, { status: 201 });
}
