/* @flow */

import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import PathWatcher from './path-watcher'
import store from './store'
import App from './react/app'

export default class Session {

  _pathWatcher: PathWatcher
  _panel: Atom$Panel

  constructor () {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })
    render(<Provider store={store}>
      <App />
    </Provider>, this._panel.getItem())

    const dir = atom.config.get('textual-velocity.path')
    this._pathWatcher = new PathWatcher(dir, action => {
      store.dispatch(action)
    })
  }

  dispose () {
    this._pathWatcher.dispose()
    this._panel.destroy()
  }
}
