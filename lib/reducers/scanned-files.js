/* @flow */

function scannedFiles (state: Array<Object> = [], action: any) {
  switch (action.type) {
    case 'SCANNED_FILE':
    case 'NEW_FILE':
      return state.concat({
        filename: action.filename,
        stats: action.stats
      })
    default:
      return state
  }
}

export default scannedFiles
