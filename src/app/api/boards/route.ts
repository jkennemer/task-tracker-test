import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = session.user.id;

  const [myBoards, teamBoards] = await Promise.all([
    prisma.board.findMany({
      where: { ownerId: userId, visibility: "PRIVATE" },
      include: { owner: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.board.findMany({
      where: { visibility: "SHARED" },
      include: { owner: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ myBoards, teamBoards });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { title, description, visibility, color, icon } = body;

  if (!title?.trim()) return errorResponse("Title is required");

  const board = await prisma.board.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      visibility: visibility === "SHARED" ? "SHARED" : "PRIVATE",
      color: color || "#0ea5e9",
      icon: icon || null,
      ownerId: session.user.id,
      groups: {
        create: {
          title: "Tasks",
          position: 1,
          color: "#0ea5e9",
        },
      },
    },
    include: { groups: true },
  });

  return NextResponse.json(board, { status: 201 });
}
