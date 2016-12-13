/* @flow */

export default function setupColumnHeadersReducer (columns: Columns) {
  const defaults = columns.all()
    .map(c => ({
      sortField: c.sortField,
      title: c.title,
      width: c.width
    }))

  return function columnHeadersReducer (state: Array<ColumnHeader> = defaults, action: Action) {
    return state
  }
}