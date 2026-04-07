import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string; commentId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { commentId } = await params;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return errorResponse("Comment not found", 404);
  if (comment.authorId !== session.user.id) return errorResponse("Forbidden", 403);

  const body = await req.json();
  if (!body.body?.trim()) return errorResponse("Body is required");

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { body: body.body.trim() },
    include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string; commentId: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { commentId } = await params;
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { item: { include: { group: { include: { board: { select: { ownerId: true } } } } } } },
  });
  if (!comment) return errorResponse("Comment not found", 404);

  const isAuthor = comment.authorId === session.user.id;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isAdmin = user?.role === "ADMIN";

  if (!isAuthor && !isAdmin) return errorResponse("Forbidden", 403);

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
