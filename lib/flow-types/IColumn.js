/* @flow */

import type { Note } from "./Note";
import type { CellContent, CellContentParams } from "./CellContent";

export interface IColumn {
  description: string;
  sortField: string;
  title: string;
  width: number;
  cellContent(params: CellContentParams): CellContent;

  +className?: string;
  +editCellName?: string;
  +editCellStr?: (note: Note) => string;
}
