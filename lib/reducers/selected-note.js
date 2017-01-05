/* @flow */

import Path from 'path'
import * as A from '../action-creators'

export default function selectedNoteReducer (state: ?SelectedNote = null, action: Action, nextConfig: Config, nextSifterResult: SifterResult) {
  if (nextSifterResult.items.length === 0) return null

  let filename
  let index = -1

  switch (action.type) {
    case A.SEARCH:
    case A.RESET_SEARCH:
      return null

    case A.CHANGED_ACTIVE_PANE_ITEM:
      if (!action.path) return null
      filename = action.path.replace(nextConfig.dir + Path.sep, '')
      index = nextSifterResult.items.findIndex(item => item.id === filename)
      return index >= 0
        ? {filename, index}
        : null

    case A.CLICK_ROW:
      filename = action.filename
      index = nextSifterResult.items.findIndex(item => item.id === filename)
      return index >= 0
        ? {filename, index}
        : null

    case A.SELECT_PREV:
    case A.SELECT_NEXT:
    case A.CHANGED_SORT_FIELD:
    case A.CHANGED_SORT_DIRECTION:
      const items = nextSifterResult.items
      filename = state && state.filename
      if (filename) {
        index = items.findIndex(item => item.id === filename)
      }

      switch (action.type) {
        case A.CHANGED_SORT_FIELD:
        case A.CHANGED_SORT_DIRECTION:
          if (filename && index >= 0) {
            return {filename, index}
          }
          break

        case A.SELECT_NEXT:
          index = Math.min(index + 1, items.length - 1) // stop at end of list
          break
        case A.SELECT_PREV:
          if (index === -1) {
            index = items.length // start from end of list
          }
          index = Math.max(index - 1, 0) // stop at beginning of list
          break
      }

      if (index >= 0) {
        return {
          filename: items[index].id,
          index
        }
      } else {
        return null
      }

    default:
      return state
  }
}
