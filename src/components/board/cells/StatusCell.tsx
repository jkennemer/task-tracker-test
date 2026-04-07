"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColumnSettings } from "@/types/board";

type Props = {
  value: string | null;
  settings: ColumnSettings | null;
  onSave: (value: string) => void;
};

export function StatusCell({ value, settings, onSave }: Props) {
  const options = settings?.options ?? [];
  const active = options.find((o) => o.label === value);

  return (
    <Popover>
      <PopoverTrigger className="w-full h-full px-2 py-1.5 text-sm rounded hover:bg-accent/50 text-left">
        {active ? (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ backgroundColor: active.color }}
          >
            {active.label}
          </span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        <div className="space-y-0.5">
          {options.map((opt) => (
            <button
              key={opt.label}
              className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors flex items-center gap-2"
              onClick={() => onSave(opt.label)}
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: opt.color }}
              />
              {opt.label}
            </button>
          ))}
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">No options configured</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
