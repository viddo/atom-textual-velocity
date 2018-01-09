/* @flow */

import type { Note } from "./Note";
import type { CellContent, CellContentParams } from "./CellContent";

export interface IColumn {
  className?: string;
  description: string;
  editCellName?: string;
  position?: number;
  sortField: string;
  title: string;
  width: number;

  cellContent(params: CellContentParams): CellContent;
  +editCellStr?: (note: Note) => string;
}
