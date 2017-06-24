/* @flow */

import initialScan from "./initial-scan";
import listHeight from "./list-height";
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
      initialScan: initialScan(state.initialScan, action),
      listHeight: listHeight(state.listHeight, action),
      notes: notes(state.notes, action, state.initialScan),
      queryOriginal: queryOriginal(state.queryOriginal, action),
      rowHeight: rowHeight(state.rowHeight, action),
      scrollTop: state.scrollTop,
      selectedNote: state.selectedNote,
      sifterResult: state.sifterResult
    };

    next.sifterResult = sifterResult(state.sifterResult, action, next.notes);
    if (next.initialScan.done) {
      next.selectedNote = selectedNote(
        state.selectedNote,
        action,
        next.dir,
        next.sifterResult
      );
    }
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
