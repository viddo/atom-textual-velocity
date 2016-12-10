/* @flow */

import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import {createEpicMiddleware} from 'redux-observable'
import initialScanReducer from './reducers/initial-scan'
import NotesReducer from './reducers/notes'
import App from './react/app'
import initialScanEpic from './epics/initial-scan'
import RowsReducer from './reducers/rows'
import {startInitialScan, dispose} from './action-creators.js'

export default class Session {

  _panel: Atom$Panel
  _store: any

  constructor (columns: Columns, notesFields: NotesFields) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    const notesReducer = NotesReducer(notesFields)
    const rowsReducer = RowsReducer(columns, notesFields)

    const rootReducer = (state: State, action: Action) => {
      const newState: any = {
        columns: state.columns,
        config: state.config,
        initialScan: initialScanReducer(state.initialScan, action),
        notes: notesReducer(state.notes, action, state.initialScan.rawFiles),
        pagination: state.pagination,
        query: state.query,
        rows: state.rows
      }

      newState.rows = rowsReducer(state.rows, action, newState)

      return newState
    }

    // necessary for rootReducer to work as expected
    const initialState = {
      columns: columns.all().map(c => ({
        title: c.title,
        width: c.width
      })),
      config: {
        dir: atom.config.get('textual-velocity.path'),
        listHeight: atom.config.get('textual-velocity.listHeight'),
        rowHeight: atom.config.get('textual-velocity.rowHeight'),
        sortDirection: atom.config.get('textual-velocity.sortDirection'),
        sortField: atom.config.get('textual-velocity.sortField')
      },
      initialScan: {
        rawFiles: [],
        done: false
      },
      notes: {},
      pagination: {
        start: 0,
        limit: 10
      },
      query: '',
      rows: []
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
