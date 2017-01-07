/* @flow */

import initialScan from './initial-scan'
import listHeight from './list-height'
import makeColumnHeaders from './column-headers'
import makeNotes from './notes'
import makeSifterResult from './sifter-result'
import rowHeight from './row-height'
import scrollTop from './scroll-top'
import selectedNote from './selected-note'

export default function makeRoot (columns: Columns, notesFields: NotesFields) {
  const columnHeaders = makeColumnHeaders(columns)
  const notes = makeNotes(notesFields)
  const sifterResult = makeSifterResult(notesFields)

  return function root (state: State, action: Action) {
    const next: State = {
      columnHeaders: columnHeaders(state.columnHeaders, action),
      dir: state.dir,
      initialScan: initialScan(state.initialScan, action),
      listHeight: listHeight(state.listHeight, action),
      notes: notes(state.notes, action, state.initialScan),
      rowHeight: rowHeight(state.rowHeight, action),
      scrollTop: state.scrollTop,
      selectedNote: state.selectedNote,
      sifterResult: state.sifterResult
    }

    next.sifterResult = sifterResult(state.sifterResult, action, next.notes)
    next.selectedNote = selectedNote(state.selectedNote, action, next.dir, next.sifterResult)
    next.scrollTop = scrollTop(state.scrollTop, action, next.listHeight, next.rowHeight, next.selectedNote)

    return next
  }
}
