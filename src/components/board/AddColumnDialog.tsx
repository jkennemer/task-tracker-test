"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColumnType } from "@/generated/prisma";
import { Column } from "@/types/board";
import { Type, Hash, CircleDot, Calendar, Users, Link, CheckSquare } from "lucide-react";

const PHASE1_TYPES: { type: ColumnType; label: string; icon: React.ReactNode }[] = [
  { type: ColumnType.TEXT, label: "Text", icon: <Type className="w-4 h-4" /> },
  { type: ColumnType.NUMBER, label: "Number", icon: <Hash className="w-4 h-4" /> },
  { type: ColumnType.STATUS, label: "Status", icon: <CircleDot className="w-4 h-4" /> },
  { type: ColumnType.DATE, label: "Date", icon: <Calendar className="w-4 h-4" /> },
  { type: ColumnType.PEOPLE, label: "People", icon: <Users className="w-4 h-4" /> },
  { type: ColumnType.LINK, label: "Link", icon: <Link className="w-4 h-4" /> },
  { type: ColumnType.CHECKBOX, label: "Checkbox", icon: <CheckSquare className="w-4 h-4" /> },
];

const DEFAULT_STATUS_OPTIONS = [
  { label: "Not started", color: "#6b7280" },
  { label: "In progress", color: "#3b82f6" },
  { label: "Done", color: "#22c55e" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  onColumnAdded: (column: Column) => void;
};

export function AddColumnDialog({ open, onOpenChange, boardId, onColumnAdded }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ColumnType>(ColumnType.TEXT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required");
    setLoading(true);
    setError("");

    const settings = type === ColumnType.STATUS ? { options: DEFAULT_STATUS_OPTIONS } : null;

    const res = await fetch(`/api/boards/${boardId}/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, settings }),
    });

    if (!res.ok) {
      setError("Failed to add column");
      setLoading(false);
      return;
    }

    const column = await res.json();
    onColumnAdded(column);
    onOpenChange(false);
    setTitle("");
    setType(ColumnType.TEXT);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add column</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Column name</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Column name" autoFocus />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {PHASE1_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setType(t.type)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors ${
                    type === t.type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding…" : "Add column"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
