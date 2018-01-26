/* @flow */

import type { IFileReader } from "./flow-types/IFileReader";
import type { IFileReaders } from "./flow-types/IFileReaders";

export default class FileReaders implements IFileReaders {
  _fileReaders: IFileReader[];

  constructor() {
    this._fileReaders = [];
  }

  add(...fileReaders: IFileReader[]) {
    this._fileReaders = this._fileReaders.concat(fileReaders);
  }

  remove(fileReader: IFileReader) {
    const index = this._fileReaders.indexOf(fileReader);
    if (index >= 0) {
      this._fileReaders.splice(index, 1);
    }
  }

  every(predicate: (fileReader: IFileReader) => boolean) {
    return this._fileReaders.every(predicate);
  }

  filter(predicate: (fileReader: IFileReader) => boolean) {
    return this._fileReaders.filter(predicate);
  }

  forEach(callback: (fileReader: IFileReader) => void): void {
    this._fileReaders.forEach(callback);
  }

  map<T>(mapper: (fileReader: IFileReader) => T): Array<T> {
    return this._fileReaders.map(mapper);
  }

  dispose() {
    this._fileReaders = [];
  }
}
