import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { itemId } = await params;
  const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true } });
  if (!item) return errorResponse("Item not found", 404);

  const body = await req.json();
  const { columnId, value } = body;

  if (!columnId) return errorResponse("columnId is required");

  const columnValue = await prisma.columnValue.upsert({
    where: { itemId_columnId: { itemId, columnId } },
    update: { value: value !== undefined ? String(value) : null },
    create: { itemId, columnId, value: value !== undefined ? String(value) : null },
  });

  return NextResponse.json(columnValue);
}
