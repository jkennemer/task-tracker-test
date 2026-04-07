import { ColumnType } from "@prisma/client";

export type StatusOption = { label: string; color: string };
export type DropdownOption = { label: string };

export type ColumnSettings = {
  options?: StatusOption[] | DropdownOption[];
  decimalPlaces?: number;
  unit?: string;
  showTime?: boolean;
};

export type LinkValue = { url: string; label?: string };

export function parseColumnValue(value: string | null | undefined, type: ColumnType): unknown {
  if (value === null || value === undefined) return null;
  try {
    switch (type) {
      case ColumnType.CHECKBOX:
        return JSON.parse(value) as boolean;
      case ColumnType.NUMBER:
        return JSON.parse(value) as number;
      case ColumnType.PEOPLE:
      case ColumnType.MULTI_SELECT:
        return JSON.parse(value) as string[];
      case ColumnType.LINK:
        return JSON.parse(value) as LinkValue;
      default:
        return value;
    }
  } catch {
    return value;
  }
}

export function serializeColumnValue(value: unknown, type: ColumnType): string {
  switch (type) {
    case ColumnType.CHECKBOX:
    case ColumnType.NUMBER:
    case ColumnType.PEOPLE:
    case ColumnType.MULTI_SELECT:
    case ColumnType.LINK:
      return JSON.stringify(value);
    default:
      return String(value ?? "");
  }
}
