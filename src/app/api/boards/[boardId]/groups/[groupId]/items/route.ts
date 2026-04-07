import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; groupId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { boardId, groupId } = await params;
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { boardId: true } });
  if (!group || group.boardId !== boardId) return errorResponse("Group not found", 404);

  const body = await req.json();
  const { title } = body;
  if (!title?.trim()) return errorResponse("Title is required");

  const lastItem = await prisma.item.findFirst({
    where: { groupId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const item = await prisma.item.create({
    data: {
      boardId,
      groupId,
      title: title.trim(),
      position: (lastItem?.position ?? 0) + 1,
    },
    include: { columnValues: true },
  });

  return NextResponse.json(item, { status: 201 });
}
