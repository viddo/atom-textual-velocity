/* @flow */

import type fs from "fs";
import type { NodeCallback } from "./NodeCallback";

export type FileReadFails = { [filename: string]: string[] };

export type FileReadResult = {
  filename: string,
  notePropName: string,
  value: any
};

export type FileReader = {
  notePropName: string,
  read(path: string, fileStats: fs.Stats, callback: NodeCallback): void
};
export type FileReaders = {
  add(fileReader: FileReader): void,
  remove(fileReader: FileReader): void,
  every(predicate: (fileReader: FileReader) => boolean): boolean,
  filter(predicate: (fileReader: FileReader) => boolean): Array<FileReader>,
  forEach(callback: (fileReader: FileReader) => any): any,
  map<T>(mapper: (fileReader: FileReader) => T): Array<T>
};
export type FileWriter = {
  editCellName: string,
  write(path: string, str: string, callback: NodeCallback): void
};
export type FileWriters = {
  add(fileWriter: FileWriter): void,
  find(predicate: (fileWriter: FileWriter) => boolean): FileWriter | void
};

export type RawFile = {
  filename: string,
  stats: fs.Stats
};
export type RenamedFile = {
  filename: string,
  oldFilename?: string
};
