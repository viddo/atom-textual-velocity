/* @flow */

import fs from "fs";

export default {
  notePropName: "content",

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    fs.readFile(path, "utf8", callback);
  }
};
