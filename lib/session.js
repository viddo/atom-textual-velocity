/* @flow */

import React from 'react-for-atom'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import type {Reducer} from 'redux' // eslint-disable-line
import Disposables from './disposables'
import {startInitialScan, dispose} from './action-creators.js'
import epicMiddleware from './epics'
import setupRootReducer from './reducers/index'
import App from './react/app'
import TogglePanel from './toggle-panel'
import ToggleAtomWindow from './toggle-atom-window'
import RestartSessionForNewConfigToTakeEffect from './restart-session-for-new-config-to-take-effect'

const privates = new WeakMap()

export default class Session {

  constructor (columns: Columns, notesFields: NotesFields) {
    const panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    const rootReducer: Reducer<State, Action> = setupRootReducer(columns, notesFields)
    const middlewares = applyMiddleware(epicMiddleware)
    const store = createStore(rootReducer, middlewares)

    render(<Provider store={store}>
      <App />
    </Provider>, panel.getItem())

    store.dispatch(startInitialScan())

    privates.set(this, {
      panel,
      store,
      disposables: new Disposables(
        new TogglePanel(panel),
        new ToggleAtomWindow(panel),
        new RestartSessionForNewConfigToTakeEffect()
      )
    })
  }

  dispose () {
    const {store, panel, disposables} = privates.get(this) || {}
    store.dispatch(dispose())
    panel.destroy()
    disposables.dispose()
  }
}
