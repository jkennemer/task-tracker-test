"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const COLORS = [
  "#0ea5e9", "#6366f1", "#8b5cf6", "#ec4899",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultVisibility?: "PRIVATE" | "SHARED";
};

export function CreateBoardDialog({ open, onOpenChange, defaultVisibility = "PRIVATE" }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">(defaultVisibility);
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required");
    setLoading(true);
    setError("");

    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, visibility, color }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create board");
      setLoading(false);
      return;
    }

    const board = await res.json();
    onOpenChange(false);
    setTitle("");
    setDescription("");
    router.push(`/boards/${board.id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="board-title">Title</Label>
            <Input
              id="board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Board name"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="board-desc">Description (optional)</Label>
            <Textarea
              id="board-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this board for?"
              rows={2}
            />
          </div>
          <div className="space-y-1">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#000" : "transparent",
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Visibility</Label>
            <div className="flex gap-2">
              {(["PRIVATE", "SHARED"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    visibility === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  {v === "PRIVATE" ? "Private" : "Shared"}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {visibility === "PRIVATE" ? "Only you can see this board." : "All team members can see this board."}
            </p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
