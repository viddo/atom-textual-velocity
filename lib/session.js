/* @flow */

import React from 'react-for-atom'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import type {Reducer} from 'redux' // eslint-disable-line
import thunk from 'redux-thunk'
import Disposables from './disposables'
import {startInitialScan, dispose} from './action-creators.js'
import epicMiddleware from './epics'
import makeRootReducer from './reducers/index'
import makeApp from './react/app'
import TogglePanel from './toggle-panel'
import ToggleAtomWindow from './toggle-atom-window'
import RestartSessionForNewConfigToTakeEffect from './restart-session-for-new-config-to-take-effect'

const privates = new WeakMap()

export default class Session {

  constructor (columns: Columns, notesFields: NotesFields) {
    const panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })

    const rootReducer: Reducer<State, Action> = makeRootReducer(columns, notesFields)
    const middlewares = applyMiddleware(thunk, epicMiddleware)
    const initialState: any = {dir: atom.config.get('textual-velocity.path')}
    const store = createStore(rootReducer, initialState, middlewares)

    const App = makeApp(columns)
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
