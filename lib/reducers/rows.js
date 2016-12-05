/* @flow */

import Path from 'path'
import Sifter from 'sifter'

let sifter = new Sifter()

export default (columns: Columns, notesFields: NotesFields) =>
  (state: Array<Row>, action: Action, newState: State) => {
    if (!newState.initialScan.done) return state

    const config = newState.config
    sifter.items = newState.notes // use notes as items to be search

    const sifterResult = sifter
      .search(newState.query, {
        fields: notesFields.propNames(),
        sort: [
          {field: config.sortField, direction: config.sortDirection},
          {field: '$score', direction: config.sortDirection}
        ],
        conjunction: 'and'
      })

    return sifterResult.items
      .slice(newState.pagination.start, newState.pagination.start + newState.pagination.limit)
      .map((item, i) => {
        const filename = item.id
        const note = newState.notes[filename]

        return {
          id: note.id,
          filename: filename,
          cells: columns.all().map(column => {
            return {
              content: column.cellContent({
                note: note,
                path: Path.join(config.dir, filename)
              })
            }
          })
        }
      })
  }
