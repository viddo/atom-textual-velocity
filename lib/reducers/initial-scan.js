/* @flow */

import {INITIAL_SCAN_DONE, FILE_ADDED} from '../action-creators'

const defaults = {
  done: false,
  rawFiles: []
}

export default function initialScanReducer (state: InitialScan = defaults, action: Action) {
  if (state.done) {
    return state
  }

  switch (action.type) {
    case FILE_ADDED:
      return {
        ...state,
        rawFiles: state.rawFiles.concat(action.rawFile)
      }
    case INITIAL_SCAN_DONE:
      return {
        done: true,
        rawFiles: []
      }
    default:
      return state
  }
}
