/* @flow */

import {createStore} from 'redux'
import rootReducer from './reducers/index'

const defaultState = {
  files: {},
  ui: {
    listHeight: 100
  }
}

const store = createStore(rootReducer, defaultState)

export default store
