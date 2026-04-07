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
  const comments = await prisma.comment.findMany({
    where: { itemId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { itemId } = await params;
  const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true } });
  if (!item) return errorResponse("Item not found", 404);

  const body = await req.json();
  const { body: commentBody } = body;
  if (!commentBody?.trim()) return errorResponse("Comment body is required");

  const comment = await prisma.comment.create({
    data: { itemId, body: commentBody.trim() },
    include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
