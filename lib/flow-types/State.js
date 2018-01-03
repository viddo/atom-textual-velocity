/* @flow */

import type { ColumnHeader } from "./Column";
import type { EditCellName } from "./EditCellName";
import type { FileReadFails } from "./File";
import type { LoadingState } from "./Loading";
import type { Notes } from "./Note";
import type { SearchResult } from "sifter";

export type SelectedNote = {
  index: number,
  filename: string
};

export type State = {
  columnHeaders: Array<ColumnHeader>,
  dir: string,
  editCellName: EditCellName,
  fileReadFails: FileReadFails,
  listHeight: number,
  loading: LoadingState,
  notes: Notes,
  queryOriginal: string,
  rowHeight: number,
  scrollTop: number,
  selectedNote: ?SelectedNote,
  sifterResult: SearchResult<$Keys<Notes>>
};
