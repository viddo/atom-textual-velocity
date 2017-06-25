/* @flow */

import logError from "./log-error";

const privates = new WeakMap();

export default class FileWriters {
  constructor() {
    privates.set(this, []);
  }

  add(fileWriter: FileWriter) {
    if (typeof fileWriter !== "object")
      return logError("fileWriter object is required", fileWriter);
    if (typeof fileWriter.editCellName !== "string")
      return logError("fileWriter.editCellName string is required", fileWriter);
    if (typeof fileWriter.write !== "function")
      return logError("fileWriter.write function is required", fileWriter);

    const fileWriters = privates.get(this) || [];
    fileWriters.push(fileWriter);
  }

  find(predicate: (fileWriter: FileWriter) => boolean) {
    return (privates.get(this) || []).find(predicate);
  }

  dispose() {
    privates.delete(this);
  }
}
