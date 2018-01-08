/* @flow */

import fs from "fs";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { IFileReader } from "../flow-types/IFileReader";
import type { INoteField } from "../flow-types/INoteField";

export default class ContentFileReader implements IFileReader, INoteField {
  notePropName: string;

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    fs.readFile(path, "utf8", callback);
  }
}

ContentFileReader.prototype.notePropName = "content";
