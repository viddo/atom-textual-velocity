/* @flow */

import type { IFileWriter } from "./IFileWriter";

export interface IFileWriters {
  add(fileWriter: IFileWriter): void;
  find(predicate: (fileWriter: IFileWriter) => boolean): IFileWriter | void;
}
