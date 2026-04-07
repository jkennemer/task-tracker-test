import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; groupId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId, groupId } = await params;
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { boardId: true } });
  if (!group || group.boardId !== boardId) return errorResponse("Group not found", 404);

  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { visibility: true, ownerId: true } });
  if (board?.visibility !== "SHARED" && board?.ownerId !== session.user.id) return errorResponse("Forbidden", 403);

  const body = await req.json();
  const { title, color, position, collapsed } = body;

  const updated = await prisma.group.update({
    where: { id: groupId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(color !== undefined && { color }),
      ...(position !== undefined && { position }),
      ...(collapsed !== undefined && { collapsed }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string; groupId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId, groupId } = await params;
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { boardId: true } });
  if (!group || group.boardId !== boardId) return errorResponse("Group not found", 404);

  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { visibility: true, ownerId: true } });
  if (board?.visibility !== "SHARED" && board?.ownerId !== session.user.id) return errorResponse("Forbidden", 403);

  // Don't delete the last group
  const groupCount = await prisma.group.count({ where: { boardId } });
  if (groupCount <= 1) return errorResponse("Cannot delete the last group", 400);

  await prisma.group.delete({ where: { id: groupId } });
  return NextResponse.json({ ok: true });
}
