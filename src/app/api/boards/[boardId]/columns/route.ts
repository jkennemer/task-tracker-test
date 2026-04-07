import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";
import { ColumnType } from "@/generated/prisma";

const VALID_TYPES = Object.values(ColumnType);

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
  const { title, type, settings } = body;

  if (!title?.trim()) return errorResponse("Title is required");
  if (!VALID_TYPES.includes(type)) return errorResponse("Invalid column type");

  const lastCol = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const column = await prisma.column.create({
    data: {
      boardId,
      title: title.trim(),
      type,
      settings: settings ?? null,
      position: (lastCol?.position ?? 0) + 1,
    },
  });

  return NextResponse.json(column, { status: 201 });
}
