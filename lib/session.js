/* @flow */

import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import {createEpicMiddleware} from 'redux-observable'
import forcedScrollTopReducer from './reducers/forced-scroll-top'
import initialScanReducer from './reducers/initial-scan'
import paginationReducer from './reducers/pagination'
import queryReducer from './reducers/query'
import NotesReducer from './reducers/notes'
import App from './react/app'
import initialScanEpic from './epics/initial-scan'
import VisibleRowsReducer from './reducers/visible-rows'
import {startInitialScan, dispose} from './action-creators.js'
import {limit} from './pagination'

export default class Session {

  _panel: Atom$Panel
  _store: any

  constructor (columns: Columns, notesFields: NotesFields) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    const notesReducer = NotesReducer(notesFields)
    const visibleRowsReducer = VisibleRowsReducer(columns, notesFields)

    const rootReducer = (state: State, action: Action) => {
      const config = state.config

      const newState: any = {
        columns: state.columns,
        config: config,
        forcedScrollTop: forcedScrollTopReducer(state.forcedScrollTop, action),
        initialScan: initialScanReducer(state.initialScan, action),
        notes: notesReducer(state.notes, action, state.initialScan.rawFiles),
        pagination: paginationReducer(state.pagination, action, config),
        query: queryReducer(state.query, action),
        visibleRows: state.visibleRows
      }

      newState.visibleRows = visibleRowsReducer(state.visibleRows, action, newState)

      return newState
    }

    // necessary for rootReducer to work as expected
    const listHeight = atom.config.get('textual-velocity.listHeight')
    const rowHeight = atom.config.get('textual-velocity.rowHeight')
    const initialState = {
      columns: columns.all().map(c => ({
        title: c.title,
        width: c.width
      })),
      config: {
        dir: atom.config.get('textual-velocity.path'),
        listHeight: listHeight,
        rowHeight: rowHeight,
        sortDirection: atom.config.get('textual-velocity.sortDirection'),
        sortField: atom.config.get('textual-velocity.sortField')
      },
      forcedScrollTop: null,
      initialScan: {
        rawFiles: [],
        done: false
      },
      notes: {},
      pagination: {
        start: 0,
        limit: limit({listHeight, rowHeight})
      },
      query: '',
      visibleRows: []
    }

    this._store = createStore(
      rootReducer,
      initialState,
      applyMiddleware(
        createEpicMiddleware(
          initialScanEpic)))

    render(<Provider store={this._store}>
      <App />
    </Provider>, this._panel.getItem())

    this._store.dispatch(startInitialScan())
  }

  dispose () {
    this._store.dispatch(dispose())
    this._panel.destroy()
  }
}
