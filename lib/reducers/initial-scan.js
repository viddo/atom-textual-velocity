/* @flow */

import * as A from "../action-creators";

const defaults = {
  done: false,
  rawFiles: []
};

export default function initialScanReducer(
  state: InitialScan = defaults,
  action: Action
) {
  if (state.done) {
    return state;
  }

  switch (action.type) {
    case A.FILE_ADDED:
      return {
        ...state,
        rawFiles: state.rawFiles.concat(action.rawFile)
      };

    case A.INITIAL_SCAN_DONE:
      return {
        ...state,
        done: true
      };

    case A.INITIAL_SCAN_RAW_FILES_READ:
      return {
        ...state,
        rawFiles: []
      };

    default:
      return state;
  }
}
