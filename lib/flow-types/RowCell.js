/* @flow */

import type { CellContent } from "./CellContent";

export type RowCell = RowCellEdit | RowCellRead;
type RowCellEdit = {
  type: "edit",
  editCellStr: string
};
export type RowCellRead = {
  type: "read",
  className: string,
  content: CellContent,
  editCellName: string | void
};
