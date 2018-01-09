/* @flow */

import type { IFileReader } from "./IFileReader";

export interface IFileReaders {
  add(fileReader: IFileReader): void;
  remove(fileReader: IFileReader): void;
  every(predicate: (fileReader: IFileReader) => boolean): boolean;
  filter(predicate: (fileReader: IFileReader) => boolean): IFileReader[];
  forEach(callback: (fileReader: IFileReader) => any): any;
  map<T>(mapper: (fileReader: IFileReader) => T): T[];
}
