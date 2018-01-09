/* @flow */

import type { INoteField } from "./INoteField";

export interface INoteFields {
  add(field: INoteField): void;
  forEach(callback: (noteField: INoteField) => any): any;
  map<T>(mapper: (noteField: INoteField) => T): Array<T>;
}
