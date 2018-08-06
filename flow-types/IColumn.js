/* @flow */

import type { Note } from "./Note";
import type { CellContent, CellContentParams } from "./CellContent";
import type { NotePropName } from "./Note";

export interface IColumn {
  description: string;
  sortField: NotePropName;
  title: string;
  width: number;
  cellContent(params: CellContentParams): CellContent;

  +className?: string;
  +editCellName?: NotePropName;
  +editCellStr?: (note: Note) => string;
}
