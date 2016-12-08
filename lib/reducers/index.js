/* @flow */

import {combineReducers} from 'redux'
import initialScan from './initial-scan'
import ui from './ui'

const rootReducer = combineReducers({
  initialScan,
  ui
})

export default rootReducer
