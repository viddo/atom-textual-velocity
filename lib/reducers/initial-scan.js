/* @flow */

const defaults = {
  done: false,
  rawFiles: []
}

function initialScan (state: InitialScanStateType = defaults, action: ActionType) {
  switch (action.type) {
    case 'SCANNED_FILE':
      return {
        ...state,
        rawFiles: state.rawFiles.concat(action.rawFile)
      }
    case 'INITIAL_SCAN_DONE':
      return {
        ...state,
        done: true
      }
    default:
      return state
  }
}

export default initialScan
