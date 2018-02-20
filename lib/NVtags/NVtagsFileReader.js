/* @flow */

import fs from "fs";
import NVtags from "../NVtags";
import { NV_TAGS_FILE_PROP_NAME } from "../constants";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { IFileReader } from "../flow-types/IFileReader";

export default class NVtagsFileReader implements IFileReader {
  notePropName: string;

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    NVtags.read(path, callback);
  }
}

NVtagsFileReader.prototype.notePropName = NV_TAGS_FILE_PROP_NAME;
