/* @flow */

import fs from "fs";
import * as C from "../constants";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { IFileReader } from "../flow-types/IFileReader";

export default class ContentFileReader implements IFileReader {
  notePropName: string;

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    fs.readFile(path, "utf8", callback);
  }
}

ContentFileReader.prototype.notePropName = C.CONTENT;
