import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LayoutGrid } from "lucide-react";
import { NewBoardButton } from "@/components/boards/NewBoardButton";

type SidebarBoard = { id: string; title: string; color: string; icon: string | null };

async function getSidebarBoards(): Promise<{ myBoards: SidebarBoard[]; teamBoards: SidebarBoard[] }> {
  const [myBoards, teamBoards] = await Promise.all([
    prisma.board.findMany({
      where: { visibility: "PRIVATE" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, color: true, icon: true },
    }),
    prisma.board.findMany({
      where: { visibility: "SHARED" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, color: true, icon: true },
    }),
  ]);
  return { myBoards, teamBoards };
}

export async function Sidebar() {
  const { myBoards, teamBoards } = await getSidebarBoards();

  return (
    <aside className="w-60 shrink-0 h-full bg-background border-r flex flex-col overflow-y-auto">
      <div className="p-4 border-b">
        <Link href="/boards" className="flex items-center gap-2 font-semibold text-lg">
          <LayoutGrid className="w-5 h-5" />
          Task Tracker
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-4">
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Boards</span>
            <NewBoardButton size="icon-sm" visibility="PRIVATE" />
          </div>
          <ul className="space-y-0.5">
            {myBoards.map((board) => (
              <li key={board.id}>
                <Link
                  href={`/boards/${board.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: board.color }} />
                  <span className="truncate">{board.icon ? `${board.icon} ` : ""}{board.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Team Boards</span>
            <NewBoardButton size="icon-sm" visibility="SHARED" />
          </div>
          <ul className="space-y-0.5">
            {teamBoards.map((board) => (
              <li key={board.id}>
                <Link
                  href={`/boards/${board.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: board.color }} />
                  <span className="truncate">{board.icon ? `${board.icon} ` : ""}{board.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-3 border-t">
        <NewBoardButton className="w-full" />
      </div>
    </aside>
  );
}
