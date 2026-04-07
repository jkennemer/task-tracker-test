"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  value: string | null;
  onSave: (value: string) => void;
};

export function DateCell({ value, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full h-full px-2 py-1.5 text-sm rounded hover:bg-accent/50 text-left">
        {date ? (
          format(date, "MMM d, yyyy")
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              onSave(d.toISOString());
              setOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
