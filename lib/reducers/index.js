/* @flow */

import setupColumnHeaders from './column-headers'
import setupConfig from './config'
import forcedScrollTop from './forced-scroll-top'
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
      forcedScrollTop: state.forcedScrollTop,
      initialScan: initialScan(state.initialScan, action),
      notes: notes(state.notes, action, state.initialScan && state.initialScan.rawFiles),
      pagination: pagination(state.pagination, action, cfg),
      scrollTop: scrollTop(state.scrollTop, action),
      selected: state.selected,
      sifterResult: state.sifterResult,
      visibleRows: state.visibleRows
    }

    nextState.sifterResult = sifterResult(state.sifterResult, action, cfg, nextState.notes)
    nextState.selected = selected(state.selected, action, nextState.sifterResult.items)
    nextState.forcedScrollTop = forcedScrollTop(state.forcedScrollTop, action, nextState.scrollTop, cfg, nextState.selected)

    nextState.visibleRows = visibleRows(state.visibleRows, action, nextState)

    return nextState
  }
}
