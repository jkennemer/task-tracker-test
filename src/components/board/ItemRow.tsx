"use client";

import { Column, Item, ColumnValue } from "@/types/board";
import { CellRenderer } from "./cells/CellRenderer";

type Props = {
  item: Item;
  columns: Column[];
  onCellSave: (itemId: string, columnId: string, value: string) => void;
  onOpenItem: (itemId: string) => void;
  onTitleSave: (itemId: string, title: string) => void;
};

export function ItemRow({ item, columns, onCellSave, onOpenItem, onTitleSave }: Props) {
  const valueMap = new Map<string, ColumnValue>(
    item.columnValues.map((cv) => [cv.columnId, cv])
  );

  return (
    <tr className="group border-b hover:bg-accent/20 transition-colors">
      {/* Title cell */}
      <td className="sticky left-0 bg-background group-hover:bg-accent/20 z-10 border-r min-w-[200px] max-w-[300px]">
        <div className="flex items-center gap-1 px-2 py-1.5">
          <button
            className="text-sm text-left flex-1 truncate hover:text-primary cursor-pointer font-medium"
            onClick={() => onOpenItem(item.id)}
          >
            {item.title}
          </button>
        </div>
      </td>
      {/* Column cells */}
      {columns.map((col) => {
        const cv = valueMap.get(col.id);
        return (
          <td
            key={col.id}
            className="border-r"
            style={{ minWidth: col.width ?? 150, width: col.width ?? 150 }}
          >
            <CellRenderer
              column={col}
              value={cv?.value ?? null}
              onSave={(val) => onCellSave(item.id, col.id, val)}
            />
          </td>
        );
      })}
    </tr>
  );
}
