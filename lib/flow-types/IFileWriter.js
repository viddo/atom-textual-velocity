/* @flow */

import type { NodeCallback } from "./NodeCallback";

export interface IFileWriter {
  editCellName: string;
  write(path: string, str: string, callback: NodeCallback): void;
}
