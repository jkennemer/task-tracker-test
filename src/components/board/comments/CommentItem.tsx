"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Author = { id: string; name: string | null; email: string; avatarUrl: string | null };
type Comment = {
  id: string;
  body: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
};

type Props = {
  comment: Comment;
  currentUserId: string;
  onEdit: (id: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function CommentItem({ comment, currentUserId, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [saving, setSaving] = useState(false);

  const initials = comment.author.name
    ? comment.author.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : comment.author.email[0].toUpperCase();

  const isOwnComment = comment.author.id === currentUserId;
  const wasEdited = comment.updatedAt !== comment.createdAt;

  if (comment.deletedAt) {
    return (
      <div className="flex gap-2.5 py-2">
        <div className="w-7 h-7 shrink-0" />
        <p className="text-sm text-muted-foreground italic">This comment was deleted.</p>
      </div>
    );
  }

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    await onEdit(comment.id, draft.trim());
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="flex gap-2.5 py-2 group">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={comment.author.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-sm font-medium">{comment.author.name || comment.author.email}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {wasEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="text-sm min-h-[60px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving || !draft.trim()}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(comment.body); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{comment.body}</p>
        )}
      </div>

      {isOwnComment && !editing && (
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent self-start mt-0.5">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-red-500">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
