"use client";

import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Column } from "@/types/board";
import { CellRenderer } from "./cells/CellRenderer";
import { CommentList } from "./comments/CommentList";

type Author = { id: string; name: string | null; email: string; avatarUrl: string | null };
type Comment = { id: string; body: string; deletedAt: string | null; createdAt: string; updatedAt: string; author: Author };
type ColumnValue = { id: string; itemId: string; columnId: string; value: string | null; updatedAt: string };
type ItemDetail = {
  id: string;
  title: string;
  groupId: string;
  columnValues: ColumnValue[];
  comments: Comment[];
};

type Props = {
  itemId: string | null;
  boardColumns: Column[];
  onClose: () => void;
  onItemUpdate: (itemId: string, title?: string) => void;
  onCellSave: (itemId: string, columnId: string, value: string) => void;
};

export function ItemDetailPanel({ itemId, boardColumns, onClose, onItemUpdate, onCellSave }: Props) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    if (!itemId) { setItem(null); return; }
    setLoading(true);
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data) => {
        setItem(data);
        setTitleDraft(data.title);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [itemId]);

  const handleTitleSave = useCallback(async () => {
    if (!item || titleDraft.trim() === item.title) { setEditingTitle(false); return; }
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleDraft.trim() }),
    });
    setItem((prev) => prev ? { ...prev, title: titleDraft.trim() } : prev);
    onItemUpdate(item.id, titleDraft.trim());
    setEditingTitle(false);
  }, [item, titleDraft, onItemUpdate]);

  const handleCellSave = useCallback(async (columnId: string, value: string) => {
    if (!item) return;
    // Update local state
    setItem((prev) => {
      if (!prev) return prev;
      const existing = prev.columnValues.find((cv) => cv.columnId === columnId);
      const newCv: ColumnValue = existing
        ? { ...existing, value }
        : { id: `temp-${columnId}`, itemId: prev.id, columnId, value, updatedAt: new Date().toISOString() };
      return {
        ...prev,
        columnValues: existing
          ? prev.columnValues.map((cv) => (cv.columnId === columnId ? newCv : cv))
          : [...prev.columnValues, newCv],
      };
    });
    // Also update the board view
    onCellSave(item.id, columnId, value);
  }, [item, onCellSave]);

  const valueMap = new Map<string, ColumnValue>(
    (item?.columnValues ?? []).map((cv) => [cv.columnId, cv])
  );

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
        ) : item ? (
          <>
            <SheetHeader className="px-6 py-4 border-b shrink-0">
              {editingTitle ? (
                <input
                  autoFocus
                  className="text-lg font-semibold bg-transparent border-b border-ring outline-none w-full"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave();
                    if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(item.title); }
                  }}
                />
              ) : (
                <h2
                  className="text-lg font-semibold cursor-pointer hover:text-muted-foreground transition-colors"
                  onClick={() => { setTitleDraft(item.title); setEditingTitle(true); }}
                >
                  {item.title}
                </h2>
              )}
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="px-6 py-4 space-y-6">
                {/* Column values */}
                {boardColumns.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Fields</h3>
                    <div className="space-y-2">
                      {boardColumns.map((col) => {
                        const cv = valueMap.get(col.id);
                        return (
                          <div key={col.id} className="grid grid-cols-[120px_1fr] items-center gap-2">
                            <span className="text-xs text-muted-foreground truncate">{col.title}</span>
                            <div className="border rounded min-h-[32px]">
                              <CellRenderer
                                column={col}
                                value={cv?.value ?? null}
                                onSave={(value) => handleCellSave(col.id, value)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Comments */}
                <CommentList
                  itemId={item.id}
                  initialComments={item.comments}
                  currentUserId=""
                />
              </div>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
