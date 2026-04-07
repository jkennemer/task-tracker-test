"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "default" | "icon-sm";
  visibility?: "PRIVATE" | "SHARED";
};

export function NewBoardButton({ className, size = "default", visibility }: Props) {
  const [open, setOpen] = useState(false);

  if (size === "icon-sm") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="p-0.5 rounded hover:bg-accent transition-colors"
          title="New board"
        >
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <CreateBoardDialog open={open} onOpenChange={setOpen} defaultVisibility={visibility} />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-1", className)}
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        New Board
      </Button>
      <CreateBoardDialog open={open} onOpenChange={setOpen} defaultVisibility={visibility} />
    </>
  );
}
