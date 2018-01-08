/* @flow */

import type { Stats } from "fs";

export type FileReadFails = { [filename: string]: string[] };

export type FileReadResult = {
  filename: string,
  notePropName: string,
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
