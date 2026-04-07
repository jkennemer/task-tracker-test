import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  const board = await prisma.board.findUnique({
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

  if (!board) return errorResponse("Board not found", 404);
  return NextResponse.json(board);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { id: true } });
  if (!board) return errorResponse("Board not found", 404);

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
  const { boardId } = await params;
  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { id: true } });
  if (!board) return errorResponse("Board not found", 404);

  await prisma.board.delete({ where: { id: boardId } });
  return NextResponse.json({ ok: true });
}
