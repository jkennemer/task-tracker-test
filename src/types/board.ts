import { ColumnType } from "@prisma/client";

export type User = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
};

export type ColumnValue = {
  id: string;
  itemId: string;
  columnId: string;
  value: string | null;
  updatedAt: string;
};

export type Item = {
  id: string;
  boardId: string;
  groupId: string;
  title: string;
  position: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  columnValues: ColumnValue[];
};

export type Group = {
  id: string;
  boardId: string;
  title: string;
  color: string;
  position: number;
  collapsed: boolean;
  createdAt: string;
  updatedAt: string;
  items: Item[];
};

export type ColumnSettings = {
  options?: { label: string; color: string }[];
  decimalPlaces?: number;
  unit?: string;
  showTime?: boolean;
};

export type Column = {
  id: string;
  boardId: string;
  title: string;
  type: ColumnType;
  settings: ColumnSettings | null;
  position: number;
  width: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Board = {
  id: string;
  title: string;
  description: string | null;
  visibility: "PRIVATE" | "SHARED";
  color: string;
  icon: string | null;
  ownerId: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
  groups: Group[];
  columns: Column[];
};
