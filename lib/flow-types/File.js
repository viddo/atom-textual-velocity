/* @flow */

import type { Stats } from "fs";
import type { NotePropName } from "./Note";

export type FileReadFails = { [filename: string]: string[] };

export type FileReadResult = {
  filename: string,
  notePropName: NotePropName,
  value: any
};

export type RawFile = {
  filename: string,
  stats: Stats
};
export type RenamedFile = {
  filename: string,
  oldFilename?: string
};
