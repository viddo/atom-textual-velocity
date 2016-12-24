/* @flow */

import {
  CHANGED_LIST_HEIGHT,
  CHANGED_ROW_HEIGHT,
  CHANGED_SORT_DIRECTION,
  CHANGED_SORT_FIELD,
  RESIZED_LIST
} from '../action-creators'

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
      case RESIZED_LIST:
      case CHANGED_LIST_HEIGHT:
        return {...state, listHeight: action.listHeight}
      case CHANGED_ROW_HEIGHT:
        return {...state, rowHeight: action.rowHeight}
      case CHANGED_SORT_DIRECTION:
        return {...state, sortDirection: action.sortDirection}
      case CHANGED_SORT_FIELD:
        return {...state, sortField: action.sortField}
      default:
        return state
    }
  }
}
