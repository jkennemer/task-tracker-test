import { prisma } from "@/lib/prisma";
import { BoardCard } from "@/components/boards/BoardCard";
import type { Board } from "@/components/boards/BoardCard";
import { NewBoardButton } from "@/components/boards/NewBoardButton";

async function getBoards() {
  const [myBoards, teamBoards] = await Promise.all([
    prisma.board.findMany({
      where: { visibility: "PRIVATE" },
      include: { owner: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.board.findMany({
      where: { visibility: "SHARED" },
      include: { owner: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return { myBoards, teamBoards };
}

export default async function BoardsPage() {
  const { myBoards, teamBoards } = await getBoards();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Boards</h1>
        <NewBoardButton />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">My Boards</h2>
          <NewBoardButton size="default" visibility="PRIVATE" />
        </div>
        {myBoards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No private boards yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(myBoards as Board[]).map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Team Boards</h2>
          <NewBoardButton size="default" visibility="SHARED" />
        </div>
        {teamBoards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No shared boards yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(teamBoards as Board[]).map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
