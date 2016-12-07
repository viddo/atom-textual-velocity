/* @flow */

import {createStore} from 'redux'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import PathWatcher from './path-watcher'
import rootReducer from './reducers/index'
import App from './react/app'

export default class Session {

  _pathWatcher: PathWatcher
  _panel: Atom$Panel
  _store: any

  constructor () {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    const defaultState = {
      scannedFiles: [],
      ui: {
        listHeight: 100
      }
    }

    this._store = createStore(rootReducer, defaultState)

    render(<Provider store={this._store}>
      <App />
    </Provider>, this._panel.getItem())

    const dir = atom.config.get('textual-velocity.path')
    this._pathWatcher = new PathWatcher(dir, action => {
      this._store.dispatch(action)
    })
  }

  dispose () {
    this._store.dispatch({type: 'DISPOSE'})
    this._pathWatcher.dispose()
    this._panel.destroy()
  }
}
