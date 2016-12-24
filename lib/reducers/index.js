/* @flow */

import setupColumnHeaders from './column-headers'
import setupConfig from './config'
import initialScan from './initial-scan'
import pagination from './pagination'
import scrollTop from './scroll-top'
import selected from './selected'
import setupNotes from './notes'
import setupSifterResult from './sifter-result'
import setupVisibleRows from './visible-rows'

export default function setupRoot (columns: Columns, notesFields: NotesFields) {
  const columnHeaders = setupColumnHeaders(columns)
  const config = setupConfig()
  const notes = setupNotes(notesFields)
  const sifterResult = setupSifterResult(notesFields)
  const visibleRows = setupVisibleRows(columns)

  return function root (state: State, action: Action) {
    if (!state) {
      // initial state may be empty, if so make sure reducers return their individual defaults
      return root({}, action)
    }

    const cfg = config(state.config, action)

    const nextState: any = {
      columnHeaders: columnHeaders(state.columnHeaders, action),
      config: cfg,
      initialScan: initialScan(state.initialScan, action),
      notes: notes(state.notes, action, state.initialScan && state.initialScan.rawFiles),
      pagination: state.pagination,
      scrollTop: state.scrollTop,
      selected: state.selected,
      sifterResult: state.sifterResult,
      visibleRows: state.visibleRows
    }

    nextState.sifterResult = sifterResult(state.sifterResult, action, cfg, nextState.notes)
    nextState.selected = selected(state.selected, action, nextState.sifterResult.items)
    nextState.scrollTop = scrollTop(state.scrollTop, action, cfg, nextState.selected)
    nextState.pagination = pagination(state.pagination, action, cfg, nextState.scrollTop)

    nextState.visibleRows = visibleRows(state.visibleRows, action, nextState)

    return nextState
  }
}
