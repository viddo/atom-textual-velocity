/* @flow */

import setupColumnHeadersReducer from './column-headers'
import setupConfigReducer from './config'
import forcedScrollTopReducer from './forced-scroll-top'
import initialScanReducer from './initial-scan'
import paginationReducer from './pagination'
import setupNotesReducer from './notes'
import setupSifterResult from './sifter-result'
import setupVisibleRowsReducer from './visible-rows'

export default function setupRootReducer (columns: Columns, notesFields: NotesFields) {
  const columnHeadersReducer = setupColumnHeadersReducer(columns)
  const configReducer = setupConfigReducer()
  const notesReducer = setupNotesReducer(notesFields)
  const sifterResult = setupSifterResult(notesFields)
  const visibleRowsReducer = setupVisibleRowsReducer(columns)

  return function rootReducer (state: State, action: Action) {
    if (!state) {
      // initial state may be empty, if so make sure reducers return their individual defaults
      return rootReducer({}, action)
    }

    const config = configReducer(state.config, action)

    const nextState: any = {
      columnHeaders: columnHeadersReducer(state.columnHeaders, action),
      config: config,
      forcedScrollTop: forcedScrollTopReducer(state.forcedScrollTop, action),
      initialScan: initialScanReducer(state.initialScan, action),
      notes: notesReducer(state.notes, action, state.initialScan && state.initialScan.rawFiles),
      pagination: paginationReducer(state.pagination, action, config),
      sifterResult: state.sifterResult,
      visibleRows: state.visibleRows
    }

    nextState.sifterResult = sifterResult(state.sifterResult, action, nextState)
    nextState.visibleRows = visibleRowsReducer(state.visibleRows, action, nextState)

    return nextState
  }
}
