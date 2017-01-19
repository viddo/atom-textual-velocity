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

    const columns = privates.get(this) || []
    if (typeof column.position === 'number') {
      const start = parseInt(column.position) || 0
      columns.splice(start, 0, column)
    } else {
      columns.push(column)
    }

    this._updateConfigSchema()
  }

  map<T> (mapper: (column: Column) => T): Array<T> {
    return (privates.get(this) || []).map(mapper)
  }

  some<T> (predicate: (column: Column) => T): boolean {
    return (privates.get(this) || []).some(predicate)
  }

  _updateConfigSchema () {
    const columns = privates.get(this) || []

    const schema = atom.config.getSchema('textual-velocity.sortField')
    schema.default = columns[0].sortField

    const currentVal = atom.config.get('textual-velocity.sortField')
    let hasCurrentValInEnum = false

    schema.enum = columns
      .map(column => {
        if (column.sortField === currentVal) {
          hasCurrentValInEnum = true
        }
        return {
          value: column.sortField,
          description: column.title
        }
      })

    if (!hasCurrentValInEnum) {
      schema.enum.push({
        value: currentVal,
        description: currentVal
      })
    }

    atom.config.setSchema('textual-velocity.sortField', schema)
  }
}
