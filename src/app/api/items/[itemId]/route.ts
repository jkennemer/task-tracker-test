import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      columnValues: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
      group: { select: { id: true, title: true, boardId: true } },
    },
  });

  if (!item) return errorResponse("Item not found", 404);
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { itemId } = await params;
  const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true } });
  if (!item) return errorResponse("Item not found", 404);

  const body = await req.json();
  const { title, groupId, position } = body;

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(groupId !== undefined && { groupId }),
      ...(position !== undefined && { position }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { itemId } = await params;
  const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true } });
  if (!item) return errorResponse("Item not found", 404);

  await prisma.item.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
