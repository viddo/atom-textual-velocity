/* @flow */

import makeColumnHeaders from './column-headers'
import makeConfig from './config'
import initialScan from './initial-scan'
import scrollTop from './scroll-top'
import selectedNote from './selected-note'
import makeNotes from './notes'
import makeSifterResult from './sifter-result'

export default function makeRoot (columns: Columns, notesFields: NotesFields) {
  const columnHeaders = makeColumnHeaders(columns)
  const config = makeConfig()
  const notes = makeNotes(notesFields)
  const sifterResult = makeSifterResult(notesFields)

  return function root (state: State, action: Action) {
    if (!state) {
      // initial state may be empty, if so make sure reducers return their individual defaults
      return root({}, action)
    }

    const nextState: any = {
      columnHeaders: columnHeaders(state.columnHeaders, action),
      config: config(state.config, action),
      initialScan: initialScan(state.initialScan, action),
      notes: notes(state.notes, action, state.initialScan),
      scrollTop: state.scrollTop,
      selectedNote: state.selectedNote,
      sifterResult: state.sifterResult
    }

    nextState.sifterResult = sifterResult(state.sifterResult, action, nextState.config, nextState.notes)
    nextState.selectedNote = selectedNote(state.selectedNote, action, nextState.config, nextState.sifterResult)
    nextState.scrollTop = scrollTop(state.scrollTop, action, nextState.config, nextState.selectedNote)

    return nextState
  }
}
