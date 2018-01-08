/* @flow */

import logError from "./logError";
import type { INoteField } from "./flow-types/INoteField";
import type { INoteFields } from "./flow-types/INoteFields";

export default class NoteFields implements INoteFields {
  _fields: INoteField[];

  constructor() {
    this._fields = [];
  }

  add(field: INoteField) {
    if (typeof field !== "object")
      return logError("field object is required", field);
    if (typeof field.notePropName !== "string")
      return logError("field.notePropName string is required", field);

    this._fields.push(field);
  }

  forEach<T>(callback: (noteField: INoteField) => T) {
    this._fields.forEach(callback);
  }

  map<T>(mapper: (noteField: INoteField) => T): Array<T> {
    return this._fields.map(mapper);
  }

  dispose() {
    this._fields = [];
  }
}
