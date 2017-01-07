/* @flow */

import logError from './log-error'

const privates = new WeakMap()

export default class NotesFields {

  constructor () {
    privates.set(this, [])
  }

  add (field: NoteField) {
    if (typeof field !== 'object') return logError('field object is required', field)
    if (typeof field.notePropName !== 'string') return logError('field.notePropName string is required', field)

    const fields = privates.get(this) || []
    fields.push(field)
  }

  propNames () {
    const fields = privates.get(this) || []
    return fields.map(field => field.notePropName)
  }

  forEach<T> (fn: (noteField: NoteField) => T) {
    (privates.get(this) || []).forEach(fn)
  }

  map<T> (fn: (noteField: NoteField) => T): Array<T> {
    return (privates.get(this) || []).map(fn)
  }
}
