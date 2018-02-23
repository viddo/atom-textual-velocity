/* @flow */

import type fs from "fs";
import type { IFileReader } from "../flow-types/IFileReader";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { NotePropName } from "../flow-types/Note";

type FileIconsService = { iconClassForPath: (path: string) => string[] };
let fileIconsService: FileIconsService | null = null;

// File reader for integration with https://atom.io/packages/file-icons
export default class FileIconsReader implements IFileReader {
  notePropName: NotePropName;

  static setFileIconsService(service: FileIconsService | null) {
    fileIconsService = service;
  }

  read(path: string, stats: fs.Stats, callback: NodeCallback) {
    if (!fileIconsService) {
      callback(null, null);
      return;
    }

    let classNames = fileIconsService.iconClassForPath(path);

    if (Array.isArray(classNames)) {
      classNames = classNames.join(" ");
    } else if (typeof classNames !== "string") {
      classNames = null;
    }

    callback(null, classNames);
  }
}

FileIconsReader.prototype.notePropName = "fileIcons";
