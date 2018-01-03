/* @flow */

import type fs from "fs";
import type { NodeCallback } from "../flow-types/NodeCallback";

export default {
  notePropName: "stats",

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    callback(null, stats);
  }
};
