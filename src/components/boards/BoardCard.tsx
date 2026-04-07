import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Board = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  icon: string | null;
  updatedAt: Date | string;
  owner: { id: string; name: string | null; email: string; avatarUrl: string | null };
};

export function BoardCard({ board }: { board: Board }) {
  const initials = board.owner.name
    ? board.owner.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : board.owner.email[0].toUpperCase();

  return (
    <Link
      href={`/boards/${board.id}`}
      className="group flex flex-col gap-2 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center text-white text-sm font-medium"
          style={{ backgroundColor: board.color }}
        >
          {board.icon || board.title[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {board.title}
          </p>
          {board.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{board.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
        </span>
        <Avatar className="h-5 w-5">
          <AvatarImage src={board.owner.avatarUrl ?? undefined} />
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </Link>
  );
}
