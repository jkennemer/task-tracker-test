"use client";

import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  value: string | null;
  onSave: (value: string) => void;
};

export function CheckboxCell({ value, onSave }: Props) {
  const checked = value === "true";

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onSave(String(!!v))}
      />
    </div>
  );
}
