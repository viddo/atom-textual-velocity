/* @flow */

import fs from "fs";
import NVtags from "../NVtags";
import type { IFileReader } from "../flow-types/IFileReader";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { NotePropName } from "../flow-types/Note";

export default class NVtagsFileReader implements IFileReader {
  notePropName: NotePropName;

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    NVtags.read(path, callback);
  }
}

NVtagsFileReader.prototype.notePropName = "nvtags";
