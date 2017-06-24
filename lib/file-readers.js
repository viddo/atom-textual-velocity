/* @flow */

import logError from "./log-error";

const privates = new WeakMap();

export default class FileReaders {
  constructor() {
    privates.set(this, []);
  }

  add(fileReader: FileReader) {
    if (typeof fileReader !== "object")
      return logError("fileReader object is required", fileReader);
    if (typeof fileReader.notePropName !== "string")
      return logError("fileReader.notePropName string is required", fileReader);
    if (typeof fileReader.read !== "function")
      return logError("fileReader.read function is required", fileReader);

    const fileReaders = privates.get(this) || [];
    fileReaders.push(fileReader);
  }

  remove(fileReader: FileReader) {
    const fileReaders = privates.get(this) || [];
    const index = fileReaders.indexOf(fileReader);
    if (index >= 0) {
      fileReaders.splice(index, 1);
    }
  }

  every(predicate: (fileReader: FileReader) => boolean) {
    return (privates.get(this) || []).every(predicate);
  }

  filter(predicate: (fileReader: FileReader) => boolean) {
    return (privates.get(this) || []).filter(predicate);
  }

  forEach(callback: (fileReader: FileReader) => void): void {
    (privates.get(this) || []).forEach(callback);
  }

  map<T>(mapper: (fileReader: FileReader) => T): Array<T> {
    return (privates.get(this) || []).map(mapper);
  }

  dispose() {
    privates.delete(this);
  }
}
