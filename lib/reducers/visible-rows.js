/* @flow */

import Path from 'path'
import SearchMatch from '../search-match'

export default function setupVisibleRowsReducer (columns: Columns) {
  return function visibleRowsReducer (state: Array<VisibleRow> = [], action: Action, nextState: State) {
    // NOTE if you add/remove cases you probably want to update the sifter-result reducer, too
    switch (action.type) {
      case 'SCROLLED':
      case 'SEARCH':
      case 'RESIZED_LIST':
      case 'CHANGED_LIST_HEIGHT':
      case 'CHANGED_ROW_HEIGHT':
      case 'CHANGED_SORT_DIRECTION':
      case 'CHANGED_SORT_FIELD':
      case 'RESET_SEARCH':
      case 'INITIAL_SCAN_DONE':
        const token = nextState.sifterResult.tokens[0]

        return nextState.sifterResult.items
          .slice(nextState.pagination.start, nextState.pagination.start + nextState.pagination.limit)
          .map((item, i) => {
            const filename = item.id
            const note = nextState.notes[filename]
            const cellContentParams = {
              note: note,
              path: Path.join(nextState.config.dir, filename),
              searchMatch: token && new SearchMatch(token.regex)
            }

            return {
              id: note.id,
              filename: filename,
              selected: false,
              cells: columns.all().map(column => {
                return {
                  className: column.className || '',
                  content: column.cellContent(cellContentParams)
                }
              })
            }
          })
      default:
        return state
    }
  }
}
