/* @flow */

import logError from "./log-error";
import type { FileWriter } from "./flow-types/File";

export default class FileWriters {
  _fileWriters: FileWriter[];

  constructor() {
    this._fileWriters = [];
  }

  add(fileWriter: FileWriter) {
    if (typeof fileWriter !== "object")
      return logError("fileWriter object is required", fileWriter);
    if (typeof fileWriter.editCellName !== "string")
      return logError("fileWriter.editCellName string is required", fileWriter);
    if (typeof fileWriter.write !== "function")
      return logError("fileWriter.write function is required", fileWriter);

    this._fileWriters.push(fileWriter);
  }

  find(predicate: (fileWriter: FileWriter) => boolean) {
    return this._fileWriters.find(predicate);
  }

  dispose() {
    this._fileWriters = [];
  }
}
