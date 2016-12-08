/* @flow */

import {createStore, applyMiddleware} from 'redux'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createEpicMiddleware} from 'redux-observable'
import rootReducer from './reducers/index'
import App from './react/app'
import initialScanEpic from './epics/initial-scan'
import {startInitialScan, dispose} from './action-creators.js'

export default class Session {

  _panel: Atom$Panel
  _store: any

  constructor () {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    this._store = createStore(
      rootReducer,
      applyMiddleware(createEpicMiddleware(initialScanEpic)))

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
