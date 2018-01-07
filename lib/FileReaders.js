/* @flow */

import logError from "./logError";
import type { FileReader } from "./flow-types/File";

export default class FileReaders {
  _fileReaders: FileReader[];

  constructor() {
    this._fileReaders = [];
  }

  add(fileReader: FileReader) {
    if (typeof fileReader !== "object")
      return logError("fileReader object is required", fileReader);
    if (typeof fileReader.notePropName !== "string")
      return logError("fileReader.notePropName string is required", fileReader);
    if (typeof fileReader.read !== "function")
      return logError("fileReader.read function is required", fileReader);

    this._fileReaders.push(fileReader);
  }

  remove(fileReader: FileReader) {
    const index = this._fileReaders.indexOf(fileReader);
    if (index >= 0) {
      this._fileReaders.splice(index, 1);
    }
  }

  every(predicate: (fileReader: FileReader) => boolean) {
    return this._fileReaders.every(predicate);
  }

  filter(predicate: (fileReader: FileReader) => boolean) {
    return this._fileReaders.filter(predicate);
  }

  forEach(callback: (fileReader: FileReader) => void): void {
    this._fileReaders.forEach(callback);
  }

  map<T>(mapper: (fileReader: FileReader) => T): Array<T> {
    return this._fileReaders.map(mapper);
  }

  dispose() {
    this._fileReaders = [];
  }
}
