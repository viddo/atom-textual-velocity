/* @flow */

import listHeight from "./list-height";
import loading from "./loading";
import makeColumnHeaders from "./column-headers";
import makeEditCellName from "./edit-cell-name";
import makeNotes from "./notes";
import makeSifterResult from "./sifter-result";
import queryOriginal from "./query-original";
import rowHeight from "./row-height";
import scrollTop from "./scroll-top";
import selectedNote from "./selected-note";

export default function makeRoot(
  columns: Columns,
  fileReaders: FileReaders,
  noteFields: NoteFields
) {
  const columnHeaders = makeColumnHeaders(columns);
  const editCellName = makeEditCellName(columns);
  const notes = makeNotes(fileReaders, noteFields);
  const sifterResult = makeSifterResult(noteFields);

  return function root(state: State, action: Action) {
    const next: State = {
      columnHeaders: columnHeaders(state.columnHeaders, action),
      dir: state.dir,
      editCellName: editCellName(state.editCellName, action),
      listHeight: listHeight(state.listHeight, action),
      loading: state.loading,
      notes: notes(state.notes, action, state.loading),
      queryOriginal: queryOriginal(state.queryOriginal, action),
      rowHeight: rowHeight(state.rowHeight, action),
      scrollTop: state.scrollTop,
      selectedNote: state.selectedNote,
      sifterResult: state.sifterResult
    };

    next.loading = loading(state.loading, action, next.notes);
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
