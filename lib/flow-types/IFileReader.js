/* @flow */

import type { Stats } from "fs";
import type { NodeCallback } from "./NodeCallback";

export interface IFileReader {
  notePropName: string;
  read(path: string, fileStats: Stats, callback: NodeCallback): void;
}
