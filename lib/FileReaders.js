/* @flow */

import logError from "./logError";
import type { IFileReader } from "./flow-types/IFileReader";
import type { IFileReaders } from "./flow-types/IFileReaders";

export default class FileReaders implements IFileReaders {
  _fileReaders: IFileReader[];

  constructor() {
    this._fileReaders = [];
  }

  add(fileReader: IFileReader) {
    if (typeof fileReader !== "object")
      return logError("fileReader object is required", fileReader);
    if (typeof fileReader.notePropName !== "string")
      return logError("fileReader.notePropName string is required", fileReader);
    if (typeof fileReader.read !== "function")
      return logError("fileReader.read function is required", fileReader);

    this._fileReaders.push(fileReader);
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
