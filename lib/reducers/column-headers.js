/* @flow */

export default function makeColumnHeadersReducer (columns: Columns) {
  const defaults = columns.map(c => ({
    sortField: c.sortField,
    title: c.title,
    width: c.width
  }))

  return function columnHeadersReducer (state: Array<ColumnHeader> = defaults, action: Action) {
    return state
  }
}
