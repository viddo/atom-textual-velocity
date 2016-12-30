/* @flow */

import {INITIAL_SCAN_DONE, FILE_ADDED} from '../action-creators'

const defaults = {
  done: false,
  rawFiles: []
}

export default function initialScanReducer (state: InitialScan = defaults, action: Action) {
  switch (action.type) {
    case FILE_ADDED:
      if (state.done) {
        return state
      } else {
        return {
          ...state,
          rawFiles: state.rawFiles.concat(action.rawFile)
        }
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
