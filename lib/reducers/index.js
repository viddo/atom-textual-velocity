/* @flow */

import {combineReducers} from 'redux'
import files from './files'
import ui from './ui'

const rootReducer = combineReducers({
  files,
  ui
})

export default rootReducer
