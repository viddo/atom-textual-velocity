/* @flow */

import {SCANNED_FILE, INITIAL_SCAN_DONE} from '../action-creators'

function initialScan (state: any = {done: false, files: []}, action: any) {
  switch (action.type) {
    case SCANNED_FILE:
      const files = state.files.concat(action.file)
      return {...state, files: files}
    case INITIAL_SCAN_DONE:
      return {...state, done: true}
    default:
      return state
  }
}

export default initialScan
