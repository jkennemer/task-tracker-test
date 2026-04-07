"use client";

import { useState } from "react";
import { CommentItem } from "./CommentItem";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  itemId: string;
  initialComments: Comment[];
  currentUserId: string;
};

export function CommentList({ itemId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState(initialComments);
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newBody.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/items/${itemId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newBody.trim() }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewBody("");
    }
    setSubmitting(false);
  }

  async function handleEdit(id: string, body: string) {
    const res = await fetch(`/api/items/${itemId}/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const updated = await res.json();
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/items/${itemId}/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c))
      );
    }
  }

  return (
    <div className="space-y-0">
      <h3 className="text-sm font-medium mb-3">Comments</h3>

      <div className="divide-y">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">No comments yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <Textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Write a comment…"
          className="text-sm min-h-[70px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent);
          }}
        />
        <Button type="submit" size="sm" disabled={submitting || !newBody.trim()}>
          {submitting ? "Posting…" : "Comment"}
        </Button>
      </form>
    </div>
  );
}
