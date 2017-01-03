/* @flow */

import setupColumnHeaders from './column-headers'
import setupConfig from './config'
import initialScan from './initial-scan'
import scrollTop from './scroll-top'
import selectedNote from './selected-note'
import setupNotes from './notes'
import setupSifterResult from './sifter-result'

export default function setupRoot (columns: Columns, notesFields: NotesFields) {
  const columnHeaders = setupColumnHeaders(columns)
  const config = setupConfig()
  const notes = setupNotes(notesFields)
  const sifterResult = setupSifterResult(notesFields)

  return function root (state: State, action: Action) {
    if (!state) {
      // initial state may be empty, if so make sure reducers return their individual defaults
      return root({}, action)
    }

    const nextConfig = config(state.config, action)

    const nextState: any = {
      columnHeaders: columnHeaders(state.columnHeaders, action),
      config: nextConfig,
      initialScan: initialScan(state.initialScan, action),
      notes: notes(state.notes, action, state.initialScan),
      scrollTop: state.scrollTop,
      selectedNote: selectedNote(state.selectedNote, action),
      sifterResult: state.sifterResult
    }

    nextState.sifterResult = sifterResult(state.sifterResult, action, nextConfig, nextState.notes)
    nextState.scrollTop = scrollTop(state.scrollTop, action, nextConfig, nextState.selectedNote)

    return nextState
  }
}
