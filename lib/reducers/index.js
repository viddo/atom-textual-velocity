/* @flow */

import {combineReducers} from 'redux'
import dir from './dir'
import initialScan from './initial-scan'
import ui from './ui'

const rootReducer = combineReducers({
  dir,
  initialScan,
  ui
})

export default rootReducer
