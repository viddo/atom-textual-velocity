/* @flow */

import fs from "fs-plus";
import path from "path";
import ScandalPathFilter from "./ScandalPathFilter";
import { CACHE_FILENAME } from "./NotesCache";

export default class NotesFileFilter extends ScandalPathFilter {
  dir: string;

  constructor(dir: string, options: Object = {}) {
    options.inclusions = ["*"];
    super(dir, options);

    this.dir = dir;
  }

  isAccepted(filePath: string) {
    return (
      super.isFileAccepted(filePath) &&
      !isSubDir(this.dir, filePath) &&
      !isNotesCacheFile(filePath) &&
      isTextFile(filePath)
    );
  }
}

function isSubDir(dir: string, filePath: string) {
  return filePath.replace(dir + path.sep, "").indexOf(path.sep) > -1;
}

function isNotesCacheFile(filePath) {
  return filePath.endsWith(CACHE_FILENAME);
}

function isTextFile(filePath) {
  const extname = path.extname(filePath);
  return !(
    fs.isCompressedExtension(extname) ||
    fs.isImageExtension(extname) ||
    fs.isPdfExtension(extname) ||
    fs.isBinaryExtension(extname)
  );
}
