/* @flow */

import {combineReducers} from 'redux'
import scannedFiles from './scanned-files'
import ui from './ui'

const rootReducer = combineReducers({
  scannedFiles,
  ui
})

export default rootReducer
