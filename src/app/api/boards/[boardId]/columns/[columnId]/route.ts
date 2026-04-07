import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId, columnId } = await params;
  const column = await prisma.column.findUnique({ where: { id: columnId }, select: { boardId: true } });
  if (!column || column.boardId !== boardId) return errorResponse("Column not found", 404);

  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { visibility: true, ownerId: true } });
  if (board?.visibility !== "SHARED" && board?.ownerId !== session.user.id) return errorResponse("Forbidden", 403);

  const body = await req.json();
  const { title, settings, position, width } = body;

  const updated = await prisma.column.update({
    where: { id: columnId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(settings !== undefined && { settings }),
      ...(position !== undefined && { position }),
      ...(width !== undefined && { width }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId, columnId } = await params;
  const column = await prisma.column.findUnique({ where: { id: columnId }, select: { boardId: true } });
  if (!column || column.boardId !== boardId) return errorResponse("Column not found", 404);

  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { visibility: true, ownerId: true } });
  if (board?.visibility !== "SHARED" && board?.ownerId !== session.user.id) return errorResponse("Forbidden", 403);

  await prisma.column.delete({ where: { id: columnId } });
  return NextResponse.json({ ok: true });
}
