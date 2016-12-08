/* @flow */

import {createStore, applyMiddleware} from 'redux'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createEpicMiddleware} from 'redux-observable'
import rootReducer from './reducers/index'
import App from './react/app'
import rootEpic from './epics/path-scanner'

export default class Session {

  _panel: Atom$Panel
  _store: any

  constructor () {
    const dir = atom.config.get('textual-velocity.path')

    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    const defaultState = {dir: dir}

    this._store = createStore(
      rootReducer,
      defaultState,
      applyMiddleware(createEpicMiddleware(rootEpic)))

    render(<Provider store={this._store}>
      <App />
    </Provider>, this._panel.getItem())

    this._store.dispatch({type: 'START_INITIAL_SCAN'})
  }

  dispose () {
    this._store.dispatch({type: 'DISPOSE'})
    this._panel.destroy()
  }
}
