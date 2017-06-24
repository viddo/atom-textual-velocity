/* @flow */

import fs from "fs";

export default {
  notePropName: "content",

  read(path: string, stats: FsStats, callback: NodeCallback) {
    fs.readFile(path, "utf8", callback);
  }
};
