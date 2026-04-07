"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type LinkValue = { url: string; label?: string };

type Props = {
  value: string | null;
  onSave: (value: string) => void;
};

export function LinkCell({ value, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const parsed: LinkValue | null = value ? (() => { try { return JSON.parse(value); } catch { return null; } })() : null;
  const [url, setUrl] = useState(parsed?.url ?? "");
  const [label, setLabel] = useState(parsed?.label ?? "");

  function handleSave() {
    if (!url.trim()) return;
    onSave(JSON.stringify({ url: url.trim(), label: label.trim() || undefined }));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={(v) => {
      if (v) { setUrl(parsed?.url ?? ""); setLabel(parsed?.label ?? ""); }
      setOpen(v);
    }}>
      <PopoverTrigger className="w-full h-full px-2 py-1.5 text-sm rounded hover:bg-accent/50 text-left">
        {parsed?.url ? (
          <span className="flex items-center gap-1 text-blue-500 hover:underline truncate">
            <ExternalLink className="w-3 h-3 shrink-0" />
            {parsed.label || parsed.url}
          </span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2" align="start">
        <div className="space-y-1">
          <Label className="text-xs">URL</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="h-7 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Label (optional)</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Display text" className="h-7 text-xs" />
        </div>
        <Button size="sm" className="w-full h-7 text-xs" onClick={handleSave}>Save</Button>
      </PopoverContent>
    </Popover>
  );
}
