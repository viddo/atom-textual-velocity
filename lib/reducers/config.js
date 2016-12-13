/* @flow */

export default function setupConfigReducer () {
  const defaults = {
    dir: atom.config.get('textual-velocity.path'),
    listHeight: atom.config.get('textual-velocity.listHeight'),
    rowHeight: atom.config.get('textual-velocity.rowHeight'),
    sortDirection: atom.config.get('textual-velocity.sortDirection'),
    sortField: atom.config.get('textual-velocity.sortField')
  }

  return function configReducer (state: Config = defaults, action: Action) {
    switch (action.type) {
      case 'RESIZED_LIST':
      case 'CHANGED_LIST_HEIGHT':
        return {...state, listHeight: action.listHeight}
      default:
        return state
    }
  }
}
