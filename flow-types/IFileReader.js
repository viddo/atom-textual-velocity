/* @flow */

import type { Stats } from "fs";
import type { NodeCallback } from "./NodeCallback";
import type { NotePropName } from "./Note";

export interface IFileReader {
  notePropName: NotePropName;
  read(path: string, fileStats: Stats, callback: NodeCallback): void;
}
