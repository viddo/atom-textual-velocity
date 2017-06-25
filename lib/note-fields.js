/* @flow */

import logError from "./log-error";

const privates = new WeakMap();

export default class NoteFields {
  constructor() {
    privates.set(this, []);
  }

  add(field: NoteField) {
    if (typeof field !== "object")
      return logError("field object is required", field);
    if (typeof field.notePropName !== "string")
      return logError("field.notePropName string is required", field);

    const fields = privates.get(this) || [];
    fields.push(field);
  }

  forEach<T>(callback: (noteField: NoteField) => T) {
    (privates.get(this) || []).forEach(callback);
  }

  map<T>(mapper: (noteField: NoteField) => T): Array<T> {
    return (privates.get(this) || []).map(mapper);
  }

  dispose() {
    privates.delete(this);
  }
}
