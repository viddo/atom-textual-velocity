/* @flow */

import fileReadFails from "./file-read-fails";
import listHeight from "./list-height";
import loading from "./Loading";
import newColumnHeaders from "./column-headers";
import newEditCellName from "./edit-cell-name";
import newNotes from "./notes";
import newSifterResult from "./sifter-result";
import queryOriginal from "./query-original";
import rowHeight from "./row-height";
import scrollTop from "./scroll-top";
import selectedNote from "./selected-note";
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
  const columnHeaders = newColumnHeaders(columns);
  const editCellName = newEditCellName(columns);
  const notes = newNotes(fileReaders, noteFields);
  const sifterResult = newSifterResult(noteFields);

  return function root(state: State, action: Action) {
    const next: State = {
      columnHeaders: columnHeaders(state.columnHeaders, action),
      dir: state.dir,
      editCellName: editCellName(state.editCellName, action),
      fileReadFails: fileReadFails(state.fileReadFails, action),
      listHeight: listHeight(state.listHeight, action),
      loading: state.loading,
      notes: notes(state.notes, action),
      queryOriginal: queryOriginal(state.queryOriginal, action),
      rowHeight: rowHeight(state.rowHeight, action),
      scrollTop: state.scrollTop,
      selectedNote: state.selectedNote,
      sifterResult: state.sifterResult
    };

    next.loading = loading(
      state.loading,
      action,
      next.notes,
      next.fileReadFails
    );
    next.sifterResult = sifterResult(state.sifterResult, action, next.notes);
    next.selectedNote = selectedNote(
      state.selectedNote,
      action,
      next.dir,
      next.sifterResult
    );

    next.scrollTop = scrollTop(
      state.scrollTop,
      action,
      next.listHeight,
      next.rowHeight,
      next.selectedNote
    );

    return next;
  };
}
