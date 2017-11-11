/* @flow */

import logError from "./log-error";

export default class NoteFields {
  _fields: NoteField[];

  constructor() {
    this._fields = [];
  }

  add(field: NoteField) {
    if (typeof field !== "object")
      return logError("field object is required", field);
    if (typeof field.notePropName !== "string")
      return logError("field.notePropName string is required", field);

    this._fields.push(field);
  }

  forEach<T>(callback: (noteField: NoteField) => T) {
    this._fields.forEach(callback);
  }

  map<T>(mapper: (noteField: NoteField) => T): Array<T> {
    return this._fields.map(mapper);
  }

  dispose() {
    this._fields = [];
  }
}
