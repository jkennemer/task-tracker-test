import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BoardView } from "@/components/board/BoardView";
import { Board } from "@/types/board";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
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

  if (!board) notFound();

  return <BoardView board={board as unknown as Board} />;
}
