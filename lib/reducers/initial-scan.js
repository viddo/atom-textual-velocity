/* @flow */

import {INITIAL_SCAN_DONE, SCANNED_FILE} from '../action-creators'

const defaults = {
  done: false,
  rawFiles: []
}

export default function initialScanReducer (state: InitialScan = defaults, action: Action) {
  switch (action.type) {
    case SCANNED_FILE:
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
