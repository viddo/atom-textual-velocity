/* @flow */

import Path from 'path'
import {createSelector} from 'reselect'
import SearchMatch from '../search-match'

const getConfig = (state: State) => state.config
const getNotes = (state: State) => state.notes
const getPagination = (state: State) => state.pagination
const getSelectedNote = (state: State) => state.selectedNote
const getSifterResult = (state: State) => state.sifterResult

export default function makeVisibleRowsSelector (columns: Columns) {
  return createSelector(
    [getConfig, getNotes, getPagination, getSelectedNote, getSifterResult],
    (config: Config, notes: Notes, pagination: Pagination, selectedNote: ?SelectedNote, sifterResult: SifterResult) => {
      const token = sifterResult.tokens[0]
      const selectedFilename = selectedNote && selectedNote.filename

      return sifterResult.items
        .slice(pagination.start, pagination.start + pagination.limit)
        .map((item, i) => {
          const filename = item.id
          const note = notes[filename]
          const cellContentParams = {
            note: note,
            path: Path.join(config.dir, filename),
            searchMatch: token && new SearchMatch(token.regex)
          }

          return {
            id: note.id,
            filename: filename,
            selected: filename === selectedFilename,
            cells: columns.all().map(column => {
              return {
                className: column.className || '',
                content: column.cellContent(cellContentParams)
              }
            })
          }
        })
    }
  )
}
