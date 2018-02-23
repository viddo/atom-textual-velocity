/* @flow */

import type fs from "fs";
import type { IFileReader } from "../flow-types/IFileReader";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { NotePropName } from "../flow-types/Note";

export default class StatsFileReader implements IFileReader {
  notePropName: NotePropName;

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    callback(null, stats);
  }
}

StatsFileReader.prototype.notePropName = "stats";
