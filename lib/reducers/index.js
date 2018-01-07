/* @flow */

import fileReadFailsReducer from "./fileReadFailsReducer";
import listHeightReducer from "./ListHeightReducer";
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
import type { Columns } from "../flow-types/Column";
import type { FileReaders } from "../flow-types/File";
import type { NoteFields } from "../flow-types/Note";
import type { State } from "../flow-types/State";

export default function newRoot(
  columns: Columns,
  fileReaders: FileReaders,
  noteFields: NoteFields
) {
  const columnHeadersReducer = newColumnHeadersReducer(columns);
  const editCellNameReducer = newEditCellNameReducer(columns);
  const notesReducer = newNotesReducer(fileReaders, noteFields);
  const sifterResultReducer = newSifterResultReducer(noteFields);

  return function root(state: State, action: Action) {
    const next: State = {
      columnHeaders: columnHeadersReducer(state.columnHeaders, action),
      dir: state.dir,
      editCellName: editCellNameReducer(state.editCellName, action),
      fileReadFails: fileReadFailsReducer(state.fileReadFails, action),
      listHeight: listHeightReducer(state.listHeight, action),
      loading: state.loading,
      notes: notesReducer(state.notes, action),
      queryOriginal: queryOriginalReducer(state.queryOriginal, action),
      rowHeight: rowHeightReducer(state.rowHeight, action),
      scrollTop: state.scrollTop,
      selectedNote: state.selectedNote,
      sifterResult: state.sifterResult
    };

    next.loading = loadingReducer(
      state.loading,
      action,
      next.notes,
      next.fileReadFails
    );
    next.sifterResult = sifterResultReducer(
      state.sifterResult,
      action,
      next.notes
    );
    next.selectedNote = selectedNoteReducer(
      state.selectedNote,
      action,
      next.dir,
      next.sifterResult
    );

    next.scrollTop = scrollTopReducer(
      state.scrollTop,
      action,
      next.listHeight,
      next.rowHeight,
      next.selectedNote
    );

    return next;
  };
}
