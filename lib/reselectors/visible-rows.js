/* @flow */

import Path from 'path'
import {createSelector} from 'reselect'
import SearchMatch from '../search-match'

const getDir = (state: State) => state.dir
const getEditCellName = (state: State) => state.editCellName
const getNotes = (state: State) => state.notes
const getSelectedNote = (state: State) => state.selectedNote
const getSifterResult = (state: State) => state.sifterResult

export default function makeVisibleRowsSelector (columns: Columns, paginationSelector: (state: State) => Pagination) {
  return createSelector(
    getDir,
    getEditCellName,
    getNotes,
    paginationSelector,
    getSelectedNote,
    getSifterResult,
    (dir: string, editCellName: EditCellName, notes: Notes, pagination: Pagination, selectedNote: ?SelectedNote, sifterResult: SifterResult) => {
      const token = sifterResult.tokens[0]
      const selectedFilename = selectedNote && selectedNote.filename

      return sifterResult.items
        .slice(pagination.start, pagination.start + pagination.limit)
        .map((item, i) => {
          const filename = item.id
          const note = notes[filename]
          const cellContentParams = {
            note,
            path: Path.join(dir, filename),
            searchMatch: token && new SearchMatch(token.regex)
          }
          const selected = filename === selectedFilename

          return {
            id: note.id,
            filename,
            selected,
            cells: columns.map(column => {
              if (selected && editCellName === column.editCellName) {
                return {
                  editCellStr: (column.editCellStr && column.editCellStr(note)) || ''
                }
              } else {
                return {
                  className: column.className || '',
                  content: column.cellContent(cellContentParams),
                  editCellName: column.editCellName
                }
              }
            })
          }
        })
    }
  )
}
