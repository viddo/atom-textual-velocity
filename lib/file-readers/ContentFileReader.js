/* @flow */

import fs from "fs";
import type { NodeCallback } from "../flow-types/NodeCallback";

export default {
  notePropName: "content",

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    fs.readFile(path, "utf8", callback);
  }
};
