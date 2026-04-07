"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { Group, Column, Item } from "@/types/board";
import { ItemRow } from "./ItemRow";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  group: Group;
  columns: Column[];
  onCellSave: (itemId: string, columnId: string, value: string) => void;
  onOpenItem: (itemId: string) => void;
  onTitleSave: (itemId: string, title: string) => void;
  onAddItem: (groupId: string) => void;
  onGroupUpdate: (groupId: string, data: Partial<Group>) => void;
  onGroupDelete: (groupId: string) => void;
  boardId: string;
};

export function GroupSection({
  group, columns, onCellSave, onOpenItem, onTitleSave,
  onAddItem, onGroupUpdate, onGroupDelete, boardId,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(group.title);

  async function saveTitle() {
    if (titleDraft.trim() === group.title) return setEditingTitle(false);
    await fetch(`/api/boards/${boardId}/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleDraft }),
    });
    onGroupUpdate(group.id, { title: titleDraft });
    setEditingTitle(false);
  }

  async function toggleCollapse() {
    const collapsed = !group.collapsed;
    await fetch(`/api/boards/${boardId}/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collapsed }),
    });
    onGroupUpdate(group.id, { collapsed });
  }

  async function handleDelete() {
    if (!confirm(`Delete group "${group.title}" and all its items?`)) return;
    const res = await fetch(`/api/boards/${boardId}/groups/${group.id}`, { method: "DELETE" });
    if (res.ok) onGroupDelete(group.id);
  }

  return (
    <tbody>
      {/* Group header row */}
      <tr className="border-b">
        <td colSpan={columns.length + 1} className="p-0">
          <div
            className="flex items-center gap-2 px-2 py-1.5"
            style={{ borderLeft: `3px solid ${group.color}` }}
          >
            <button onClick={toggleCollapse} className="text-muted-foreground hover:text-foreground">
              {group.collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {editingTitle ? (
              <input
                autoFocus
                className="text-sm font-semibold bg-transparent border-b border-ring outline-none"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
              />
            ) : (
              <span
                className="text-sm font-semibold cursor-pointer"
                onDoubleClick={() => { setTitleDraft(group.title); setEditingTitle(true); }}
              >
                {group.title}
              </span>
            )}

            <span className="text-xs text-muted-foreground ml-1">{group.items.length}</span>

            <DropdownMenu>
              <DropdownMenuTrigger className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => { setTitleDraft(group.title); setEditingTitle(true); }}>
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>

      {/* Item rows */}
      {!group.collapsed && group.items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          columns={columns}
          onCellSave={onCellSave}
          onOpenItem={onOpenItem}
          onTitleSave={onTitleSave}
        />
      ))}

      {/* Add item row */}
      {!group.collapsed && (
        <tr className="border-b">
          <td colSpan={columns.length + 1} className="px-4 py-1.5">
            <button
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onAddItem(group.id)}
            >
              <Plus className="w-3.5 h-3.5" /> Add item
            </button>
          </td>
        </tr>
      )}
    </tbody>
  );
}
