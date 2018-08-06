/* @flow */

import fs from "fs";
import type { NodeCallback } from "../../flow-types/NodeCallback";
import type { IFileReader } from "../../flow-types/IFileReader";
import type { NotePropName } from "../../flow-types/Note";

export default class ContentFileReader implements IFileReader {
  notePropName: NotePropName;

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    fs.readFile(path, "utf8", callback);
  }
}

ContentFileReader.prototype.notePropName = "content";
