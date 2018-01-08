/* @flow */

import fileReadFailsReducer from "./fileReadFailsReducer";
import listHeightReducer from "./listHeightReducer";
import loadingReducer from "./loadingReducer";
import newColumnHeadersReducer from "./columnHeadersReducer";
import newEditCellNameReducer from "./editCellNameReducer";
import newNotesReducer from "./notesReducer";
import newSifterResultReducer from "./sifterResultReducer";
import queryOriginalReducer from "./queryOriginalReducer";
import rowHeightReducer from "./rowHeightReducer";
import scrollTopReducer from "./scrollTopReducer";
import selectedNoteReducer from "./selectedNoteReducer";
import type { Action } from "../actions";
import type { IColumns } from "../flow-types/IColumns";
import type { IFileReaders } from "../flow-types/IFileReaders";
import type { INoteFields } from "../flow-types/INoteFields";
import type { State } from "../flow-types/State";

export default function newRoot(
  columns: IColumns,
  fileReaders: IFileReaders,
  noteFields: INoteFields
) {
  const columnHeadersReducer = newColumnHeadersReducer(columns);
  const editCellNameReducer = newEditCellNameReducer(columns);
  const notesReducer = newNotesReducer(fileReaders, noteFields);
  const sifterResultReducer = newSifterResultReducer(noteFields);

  return function root(state: State, action: Action) {
    const fileReadFails = fileReadFailsReducer(state.fileReadFails, action);
    const notes = notesReducer(state.notes, action);
    const sifterResult = sifterResultReducer(state.sifterResult, action, notes);
    const listHeight = listHeightReducer(state.listHeight, action);
    const rowHeight = rowHeightReducer(state.rowHeight, action);
    const selectedNote = selectedNoteReducer(
      state.selectedNote,
      action,
      state.dir,
      sifterResult
    );
    const scrollTop = scrollTopReducer(
      state.scrollTop,
      action,
      listHeight,
      rowHeight,
      selectedNote
    );

    return {
      columnHeaders: columnHeadersReducer(state.columnHeaders, action),
      dir: state.dir,
      editCellName: editCellNameReducer(state.editCellName, action),
      fileReadFails,
      listHeight,
      loading: loadingReducer(state.loading, action, notes, fileReadFails),
      notes,
      queryOriginal: queryOriginalReducer(state.queryOriginal, action),
      rowHeight,
      scrollTop,
      selectedNote,
      sifterResult
    };
  };
}
