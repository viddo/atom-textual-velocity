/* @flow */

function initialScan (state: any, action: any) {
  switch (action.type) {
    case 'SCANNED_FILE':
      const files = state.files.concat({
        filename: action.filename,
        stats: action.stats
      })
      return {...state, files: files}
    case 'INITIAL_SCAN_DONE':
      return {...state, done: true}
    default:
      return state || {
        done: false,
        files: []
      }
  }
}

export default initialScan
