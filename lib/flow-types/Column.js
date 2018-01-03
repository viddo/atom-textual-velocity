/* @flow */

import type { Note } from "./Note";
import type { CellContent, CellContentParams } from "./CellContent";

export type Column = {
  cellContent(params: CellContentParams): CellContent,
  className?: string,
  description: string,
  editCellName?: string,
  editCellStr?: (note: Note) => string,
  position?: number,
  sortField: string,
  title: string,
  width: number
};
export type Columns = {
  add(column: Column): void,
  filter(predicate: (column: Column) => boolean): Column[],
  map<T>(mapper: (column: Column) => T): Array<T>,
  some(predicate: (column: Column) => boolean): boolean
};

export type ColumnHeader = {
  sortField: string,
  title: string,
  width: number
};
