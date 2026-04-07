"use client";

import { useState, useCallback } from "react";
import { Board, Group, Column, Item, ColumnValue } from "@/types/board";
import { GroupSection } from "./GroupSection";
import { AddColumnDialog } from "./AddColumnDialog";
import { ItemDetailPanel } from "./ItemDetailPanel";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

type Props = {
  board: Board;
};

export function BoardView({ board: initialBoard }: Props) {
  const router = useRouter();
  const [board, setBoard] = useState(initialBoard);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [addingItemInGroup, setAddingItemInGroup] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");

  // --- Cell save ---
  const handleCellSave = useCallback(async (itemId: string, columnId: string, value: string) => {
    // Optimistic update
    setBoard((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => ({
        ...g,
        items: g.items.map((item) => {
          if (item.id !== itemId) return item;
          const existing = item.columnValues.find((cv) => cv.columnId === columnId);
          const newCv: ColumnValue = existing
            ? { ...existing, value }
            : { id: `temp-${columnId}`, itemId, columnId, value, updatedAt: new Date().toISOString() };
          return {
            ...item,
            columnValues: existing
              ? item.columnValues.map((cv) => (cv.columnId === columnId ? newCv : cv))
              : [...item.columnValues, newCv],
          };
        }),
      })),
    }));

    await fetch(`/api/items/${itemId}/column-values`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId, value }),
    });
  }, []);

  // --- Add item ---
  async function commitNewItem(groupId: string) {
    if (!newItemTitle.trim()) {
      setAddingItemInGroup(null);
      setNewItemTitle("");
      return;
    }
    const res = await fetch(`/api/boards/${board.id}/groups/${groupId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newItemTitle.trim() }),
    });
    if (res.ok) {
      const item = await res.json();
      setBoard((prev) => ({
        ...prev,
        groups: prev.groups.map((g) =>
          g.id === groupId ? { ...g, items: [...g.items, item] } : g
        ),
      }));
    }
    setAddingItemInGroup(null);
    setNewItemTitle("");
  }

  function handleAddItem(groupId: string) {
    setAddingItemInGroup(groupId);
    setNewItemTitle("");
  }

  // --- Add group ---
  async function handleAddGroup() {
    const res = await fetch(`/api/boards/${board.id}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Group" }),
    });
    if (res.ok) {
      const group = await res.json();
      setBoard((prev) => ({ ...prev, groups: [...prev.groups, { ...group, items: [] }] }));
    }
  }

  // --- Group updates ---
  function handleGroupUpdate(groupId: string, data: Partial<Group>) {
    setBoard((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === groupId ? { ...g, ...data } : g)),
    }));
  }

  function handleGroupDelete(groupId: string) {
    setBoard((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== groupId),
    }));
  }

  // --- Column added ---
  function handleColumnAdded(column: Column) {
    setBoard((prev) => ({ ...prev, columns: [...prev.columns, column] }));
  }

  // --- Column delete ---
  async function handleColumnDelete(columnId: string) {
    if (!confirm("Delete this column and all its values?")) return;
    const res = await fetch(`/api/boards/${board.id}/columns/${columnId}`, { method: "DELETE" });
    if (res.ok) {
      setBoard((prev) => ({ ...prev, columns: prev.columns.filter((c) => c.id !== columnId) }));
    }
  }

  // --- Title save ---
  const handleTitleSave = useCallback(async (itemId: string, title: string) => {
    await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setBoard((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => ({
        ...g,
        items: g.items.map((item) => (item.id === itemId ? { ...item, title } : item)),
      })),
    }));
  }, []);

  // --- Board delete ---
  async function handleBoardDelete() {
    if (!confirm(`Delete board "${board.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/boards/${board.id}`, { method: "DELETE" });
    if (res.ok) router.push("/boards");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b shrink-0">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: board.color }}
        >
          {board.icon || board.title[0]?.toUpperCase()}
        </div>
        <h1 className="font-semibold">{board.title}</h1>
        <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
          {board.visibility === "SHARED" ? "Shared" : "Private"}
        </span>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded hover:bg-accent">
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBoardDelete} className="text-red-500">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          {/* Column headers */}
          <thead className="sticky top-0 z-20 bg-background">
            <tr className="border-b">
              <th className="sticky left-0 bg-background z-30 border-r text-left px-2 py-2 font-medium text-muted-foreground text-xs min-w-[200px]">
                Item
              </th>
              {board.columns.map((col) => (
                <th
                  key={col.id}
                  className="border-r text-left px-2 py-2 font-medium text-muted-foreground text-xs"
                  style={{ minWidth: col.width ?? 150, width: col.width ?? 150 }}
                >
                  <div className="flex items-center justify-between gap-1 group">
                    <span className="truncate">{col.title}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent shrink-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleColumnDelete(col.id)} className="text-red-500">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </th>
              ))}
              <th className="px-2 py-2">
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> Add column
                </button>
              </th>
            </tr>
          </thead>

          {/* Groups */}
          {board.groups.map((group) => (
            <GroupSection
              key={group.id}
              group={group}
              columns={board.columns}
              boardId={board.id}
              onCellSave={handleCellSave}
              onOpenItem={setOpenItemId}
              onTitleSave={handleTitleSave}
              onAddItem={handleAddItem}
              onGroupUpdate={handleGroupUpdate}
              onGroupDelete={handleGroupDelete}
            />
          ))}

          {/* Inline new item input */}
          {addingItemInGroup && (
            <tbody>
              <tr className="border-b">
                <td colSpan={board.columns.length + 1} className="px-4 py-1.5">
                  <input
                    autoFocus
                    className="w-full text-sm bg-transparent outline-none border-b border-ring"
                    placeholder="Item title…"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitNewItem(addingItemInGroup);
                      if (e.key === "Escape") { setAddingItemInGroup(null); setNewItemTitle(""); }
                    }}
                    onBlur={() => commitNewItem(addingItemInGroup)}
                  />
                </td>
              </tr>
            </tbody>
          )}

          {/* Add group */}
          <tbody>
            <tr>
              <td colSpan={board.columns.length + 2} className="px-4 py-3">
                <button
                  onClick={handleAddGroup}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add group
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add column dialog */}
      <AddColumnDialog
        open={showAddColumn}
        onOpenChange={setShowAddColumn}
        boardId={board.id}
        onColumnAdded={handleColumnAdded}
      />

      {/* Item detail panel */}
      <ItemDetailPanel
        itemId={openItemId}
        boardColumns={board.columns}
        onClose={() => setOpenItemId(null)}
        onItemUpdate={(itemId, title) => {
          if (title !== undefined) handleTitleSave(itemId, title);
        }}
        onCellSave={handleCellSave}
      />
    </div>
  );
}
