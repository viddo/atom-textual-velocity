/* @flow */

import type fs from "fs";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { IFileReader } from "../flow-types/IFileReader";

export default class StatsFileReader implements IFileReader {
  notePropName: string;

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    callback(null, stats);
  }
}

StatsFileReader.prototype.notePropName = "stats";
