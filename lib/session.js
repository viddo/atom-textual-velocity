/* @flow */

import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import {createEpicMiddleware} from 'redux-observable'
import initialScanReducer from './reducers/initial-scan'
import NotesReducer from './reducers/notes'
import uiReducer from './reducers/ui'
import App from './react/app'
import initialScanEpic from './epics/initial-scan'
import {startInitialScan, dispose} from './action-creators.js'

export default class Session {

  _panel: Atom$Panel
  _store: any

  constructor (notesFields: NotesFieldsType) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    const notesReducer = NotesReducer(notesFields)

    const rootReducer = (state: StateType, action: ActionType) => {
      return {
        initialScan: initialScanReducer(state.initialScan, action),
        notes: notesReducer(state.notes, action, state.initialScan.rawFiles),
        ui: uiReducer(state.ui, action)
      }
    }

    const initialState = {
      notes: {},
      initialScan: {
        rawFiles: [],
        done: false
      },
      ui: {
        listHeight: 100
      }
    }

    this._store = createStore(
      rootReducer,
      initialState,
      applyMiddleware(
        createEpicMiddleware(initialScanEpic)))

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
