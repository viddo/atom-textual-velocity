/* @flow */

import Path from 'path'

export default (columns: Columns) =>
  (state: Array<Row>, action: Action, nextState: State) => {
    switch (action.type) {
      case 'SCROLLED':
      case 'SEARCH':
      case 'INITIAL_SCAN_DONE':
        return nextState.sifterResult.items
          .slice(nextState.pagination.start, nextState.pagination.start + nextState.pagination.limit)
          .map((item, i) => {
            const filename = item.id
            const note = nextState.notes[filename]

            return {
              id: note.id,
              filename: filename,
              cells: columns.all().map(column => {
                return {
                  content: column.cellContent({
                    note: note,
                    path: Path.join(nextState.config.dir, filename)
                  })
                }
              })
            }
          })
      default:
        return state
    }
  }
