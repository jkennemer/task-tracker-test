"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNav({ boardTitle }: { boardTitle?: string }) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="h-12 border-b flex items-center justify-between px-4 shrink-0 bg-background">
      <div className="flex-1">
        {boardTitle && (
          <span className="font-medium text-sm">{boardTitle}</span>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-0.5">
              {user?.name && <span className="font-medium text-sm">{user.name}</span>}
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
