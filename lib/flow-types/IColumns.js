/* @flow */

import type { IColumn } from "./IColumn";

export interface IColumns {
  add(column: IColumn): void;
  filter(predicate: (column: IColumn) => boolean): IColumn[];
  map<T>(mapper: (column: IColumn) => T): Array<T>;
  some(predicate: (column: IColumn) => boolean): boolean;
}
