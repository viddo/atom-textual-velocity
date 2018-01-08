/* @flow */

import logError from "./logError";
import type { IFileWriter } from "./flow-types/IFileWriter";
import type { IFileWriters } from "./flow-types/IFileWriters";

export default class FileWriters implements IFileWriters {
  _fileWriters: IFileWriter[];

  constructor() {
    this._fileWriters = [];
  }

  add(fileWriter: IFileWriter) {
    if (typeof fileWriter !== "object")
      return logError("fileWriter object is required", fileWriter);
    if (typeof fileWriter.editCellName !== "string")
      return logError("fileWriter.editCellName string is required", fileWriter);
    if (typeof fileWriter.write !== "function")
      return logError("fileWriter.write function is required", fileWriter);

    this._fileWriters.push(fileWriter);
  }

  find(predicate: (fileWriter: IFileWriter) => boolean) {
    return this._fileWriters.find(predicate);
  }

  dispose() {
    this._fileWriters = [];
  }
}
