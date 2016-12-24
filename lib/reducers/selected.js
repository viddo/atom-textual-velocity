/* @flow */

import {
  CHANGED_SORT_DIRECTION,
  CHANGED_SORT_FIELD,
  RESET_SEARCH,
  SEARCH,
  SELECT_NEXT_NOTE,
  SELECT_PREV_NOTE
} from '../action-creators'

export default function selected (state: Selected = null, action: Action, items: Array<SifterResultItem>) {
  let filename
  let index: ?number

  switch (action.type) {
    case SEARCH:
    case RESET_SEARCH:
      return null
    case CHANGED_SORT_FIELD:
    case CHANGED_SORT_DIRECTION:
      filename = state && state.filename
      if (!filename) return null

      index = items.findIndex(item => item.id === filename)
      return index
        ? {index, filename}
        : null
    case SELECT_PREV_NOTE:
    case SELECT_NEXT_NOTE:
      if (items.length === 0) return null

      filename = state && state.filename

      if (filename) {
        index = items.findIndex(item => item.id === filename)
      }

      if (action.type === SELECT_PREV_NOTE) {
        if (!Number.isInteger(index)) {
          index = items.length // start from end of list
        }
        index = Math.max((index || 0) - 1, 0) // prev or stop at beginning of list
      } else if (action.type === SELECT_NEXT_NOTE) {
        if (!Number.isInteger(index)) {
          index = -1 // start from the beginning of list
        }
        index = Math.min(index + 1, items.length - 1) // next or stop at end of list
      }

      const index_: number = (index: any)

      return {
        index: index_,
        filename: items[index_].id
      }
    default:
      return state
  }
}
