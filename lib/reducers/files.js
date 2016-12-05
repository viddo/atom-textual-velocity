/* @flow */

function files (state: {} = {}, action: any) {
  switch (action.type) {
    case 'ADDED_FILE':
      const newFile = {}
      newFile[action.filename] = {stats: action.stats}
      return Object.assign({}, state, newFile)
    default:
      return state
  }
}

export default files
