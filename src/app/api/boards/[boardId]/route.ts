import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

async function canAccessBoard(userId: string, boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true, ownerId: true, visibility: true },
  });
  if (!board) return { board: null, allowed: false };
  const allowed = board.visibility === "SHARED" || board.ownerId === userId;
  return { board, allowed };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId } = await params;
  const { board, allowed } = await canAccessBoard(session.user.id, boardId);
  if (!board) return errorResponse("Board not found", 404);
  if (!allowed) return errorResponse("Forbidden", 403);

  const fullBoard = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      columns: { orderBy: { position: "asc" } },
      groups: {
        orderBy: { position: "asc" },
        include: {
          items: {
            orderBy: { position: "asc" },
            include: { columnValues: true },
          },
        },
      },
    },
  });

  return NextResponse.json(fullBoard);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId } = await params;
  const { board, allowed } = await canAccessBoard(session.user.id, boardId);
  if (!board) return errorResponse("Board not found", 404);
  if (!allowed) return errorResponse("Forbidden", 403);

  const body = await req.json();
  const { title, description, visibility, color, icon } = body;

  const updated = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(visibility !== undefined && { visibility }),
      ...(color !== undefined && { color }),
      ...(icon !== undefined && { icon }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId } = await params;
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { ownerId: true },
  });
  if (!board) return errorResponse("Board not found", 404);
  if (board.ownerId !== session.user.id) return errorResponse("Forbidden", 403);

  await prisma.board.delete({ where: { id: boardId } });
  return NextResponse.json({ ok: true });
}
