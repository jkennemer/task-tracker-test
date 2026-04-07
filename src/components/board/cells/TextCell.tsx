"use client";

import { useState } from "react";

type Props = {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
};

export function TextCell({ value, onSave, placeholder = "" }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <div
        className="w-full h-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/50 rounded truncate"
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        {value || <span className="text-muted-foreground/50">{placeholder}</span>}
      </div>
    );
  }

  return (
    <input
      autoFocus
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
