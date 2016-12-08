/* @flow */

function initialScan (state: InitialScanStoreType = {done: false, files: []}, action: ActionType) {
  switch (action.type) {
    case 'SCANNED_FILE':
      const files = state.files.concat(action.file)
      return {...state, files: files}
    case 'INITIAL_SCAN_DONE':
      return {...state, done: true}
    default:
      return state
  }
}

export default initialScan
