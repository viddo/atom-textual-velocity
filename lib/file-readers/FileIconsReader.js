/* @flow */

import type fs from "fs";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { IFileReader } from "../flow-types/IFileReader";

// File reader for integration with https://atom.io/packages/file-icons
export default class FileIconsReader implements IFileReader {
  notePropName: string;
  _fileIconsService: { iconClassForPath: (path: string) => Array<string> };

  constructor(fileIconsService: {
    iconClassForPath: (path: string) => Array<string>
  }) {
    this._fileIconsService = fileIconsService;
  }

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    let classNames = this._fileIconsService.iconClassForPath(path);

    if (classNames instanceof Array) {
      classNames = classNames.join(" ");
    } else if (typeof classNames !== "string") {
      classNames = null;
    }

    callback(null, classNames);
  }
}

FileIconsReader.prototype.notePropName = "fileIcons";
