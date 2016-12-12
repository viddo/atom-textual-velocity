/* @flow */

import Path from 'path'
import SearchMatch from '../search-match'

export default function setupVisibleRowsReducer (columns: Columns) {
  return function visibleRowsReducer (state: Array<Row> = [], action: Action, nextState: State) {
    switch (action.type) {
      case 'SCROLLED':
      case 'SEARCH':
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
              cells: columns.all().map(column => {
                return {
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
