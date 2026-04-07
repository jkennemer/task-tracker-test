"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";

type User = { id: string; name: string | null; email: string; avatarUrl: string | null };

type Props = {
  value: string | null;
  onSave: (value: string) => void;
};

function getInitials(user: User) {
  return user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();
}

export function PeopleCell({ value, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const selected: string[] = value ? (() => { try { return JSON.parse(value); } catch { return []; } })() : [];

  useEffect(() => {
    if (open && users.length === 0) {
      fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {});
    }
  }, [open, users.length]);

  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    onSave(JSON.stringify(next));
  }

  const selectedUsers = users.filter((u) => selected.includes(u.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full h-full px-2 py-1.5 text-sm rounded hover:bg-accent/50 text-left">
        {selectedUsers.length > 0 ? (
          <div className="flex -space-x-1">
            {selectedUsers.slice(0, 3).map((u) => (
              <Avatar key={u.id} className="h-5 w-5 border border-background">
                <AvatarImage src={u.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[9px]">{getInitials(u)}</AvatarFallback>
              </Avatar>
            ))}
            {selectedUsers.length > 3 && (
              <span className="text-xs text-muted-foreground pl-2">+{selectedUsers.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1" align="start">
        {users.length === 0 ? (
          <p className="text-xs text-muted-foreground p-2">Loading…</p>
        ) : (
          users.map((user) => (
            <button
              key={user.id}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors"
              onClick={() => toggle(user.id)}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[9px]">{getInitials(user)}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-left truncate">{user.name || user.email}</span>
              {selected.includes(user.id) && <Check className="w-3 h-3 text-primary" />}
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
