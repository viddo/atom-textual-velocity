/* @flow */

import logError from './log-error'

const privates = new WeakMap()

export default class Columns {

  constructor () {
    privates.set(this, [])
  }

  add (column: Column) {
    if (typeof column !== 'object') return logError('column object is required', column)
    if (typeof column.sortField !== 'string') return logError('column.sortField string is required', column)
    if (typeof column.title !== 'string') return logError('column.title string is required', column)
    if (typeof column.cellContent !== 'function') return logError('column.cellContent function is required, was', column)

    if (typeof column.position === 'number') {
      const start = column.position || 0
      privates.get(this).splice(start, 0, column)
    } else {
      privates.get(this).push(column)
    }

    this._updateConfigSchemaOnColumnsChange()
  }

  all (): Array<Column> {
    return privates.get(this)
  }

  _updateConfigSchemaOnColumnsChange () {
    const columns = privates.get(this)

    const schema = atom.config.getSchema('textual-velocity.sortField')

    schema.default = columns[0].sortField
    schema.enum = columns.map(column => ({
      value: column.sortField,
      description: column.title
    }))
    atom.config.setSchema('textual-velocity.sortField', schema)
  }
}