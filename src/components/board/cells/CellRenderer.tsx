"use client";

import { ColumnType } from "@/generated/prisma";
import { Column } from "@/types/board";
import { TextCell } from "./TextCell";
import { NumberCell } from "./NumberCell";
import { StatusCell } from "./StatusCell";
import { DateCell } from "./DateCell";
import { CheckboxCell } from "./CheckboxCell";
import { LinkCell } from "./LinkCell";
import { PeopleCell } from "./PeopleCell";

type Props = {
  column: Column;
  value: string | null;
  onSave: (value: string) => void;
};

export function CellRenderer({ column, value, onSave }: Props) {
  switch (column.type) {
    case ColumnType.TEXT:
    case ColumnType.LONG_TEXT:
    case ColumnType.EMAIL:
    case ColumnType.PHONE:
      return <TextCell value={value ?? ""} onSave={onSave} />;
    case ColumnType.NUMBER:
      return <NumberCell value={value} settings={column.settings} onSave={onSave} />;
    case ColumnType.STATUS:
      return <StatusCell value={value} settings={column.settings} onSave={onSave} />;
    case ColumnType.DATE:
      return <DateCell value={value} onSave={onSave} />;
    case ColumnType.CHECKBOX:
      return <CheckboxCell value={value} onSave={onSave} />;
    case ColumnType.LINK:
      return <LinkCell value={value} onSave={onSave} />;
    case ColumnType.PEOPLE:
      return <PeopleCell value={value} onSave={onSave} />;
    default:
      return <TextCell value={value ?? ""} onSave={onSave} />;
  }
}
