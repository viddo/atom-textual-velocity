/* @flow */

import type { IFileWriter } from "./flow-types/IFileWriter";
import type { IFileWriters } from "./flow-types/IFileWriters";

export default class FileWriters implements IFileWriters {
  _fileWriters: IFileWriter[];

  constructor() {
    this._fileWriters = [];
  }

  add(...fileWriters: IFileWriter[]) {
    this._fileWriters = this._fileWriters.concat(fileWriters);
  }

  find(predicate: (fileWriter: IFileWriter) => boolean) {
    return this._fileWriters.find(predicate);
  }

  dispose() {
    this._fileWriters = [];
  }
}
