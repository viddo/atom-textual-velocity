/* @flow */

import type { CellContent } from "./CellContent";

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
export type RowCell = RowCellEdit | RowCellRead;
