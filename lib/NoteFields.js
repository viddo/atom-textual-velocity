/* @flow */

import type { INoteField } from "./flow-types/INoteField";
import type { INoteFields } from "./flow-types/INoteFields";

export default class NoteFields implements INoteFields {
  _fields: INoteField[];

  constructor() {
    this._fields = [];
  }

  add(...noteFields: INoteField[]) {
    this._fields = this._fields.concat(noteFields);
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
