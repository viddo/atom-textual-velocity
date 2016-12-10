/* @flow */

import logError from './log-error'

const privates = new WeakMap()

export default class NotesFields {

  constructor () {
    privates.set(this, [])
  }

  add (field: FieldType) {
    if (typeof field !== 'object') return logError('field object is required', field)
    if (typeof field.notePropName !== 'string') return logError('field.notePropName string is required', field)

    privates.get(this).push(field)
  }

  propNames () {
    return privates.get(this).map(field => field.notePropName)
  }

  all (): Array<NoteFieldType> {
    return privates.get(this)
  }
}
