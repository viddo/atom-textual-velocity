/* @flow */

import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import type {Reducer} from 'redux' // eslint-disable-line
import {startInitialScan, dispose} from './action-creators.js'
import epicMiddleware from './epics'
import App from './react/app'

export default class Session {

  _panel: Atom$Panel
  _store: any

  constructor (rootReducer: Reducer<State, Action>) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    const middlewares = applyMiddleware(epicMiddleware)
    this._store = createStore(rootReducer, middlewares)

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
