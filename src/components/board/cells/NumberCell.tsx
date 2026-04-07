"use client";

import { useState } from "react";
import { ColumnSettings } from "@/types/board";

type Props = {
  value: string | null;
  settings: ColumnSettings | null;
  onSave: (value: string) => void;
};

export function NumberCell({ value, settings, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  const display = value
    ? `${settings?.unit ? settings.unit + " " : ""}${parseFloat(value).toLocaleString()}`
    : "";

  if (!editing) {
    return (
      <div
        className="w-full h-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/50 rounded truncate"
        onClick={() => { setDraft(value ?? ""); setEditing(true); }}
      >
        {display || <span className="text-muted-foreground/50">—</span>}
      </div>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      className="w-full h-full px-2 py-1.5 text-sm bg-background border border-ring rounded outline-none"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { onSave(draft); setEditing(false); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { onSave(draft); setEditing(false); }
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}
