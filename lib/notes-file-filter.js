/* @flow */

import fs from "fs-plus";
import Path from "path";
import ScandalPathFilter from "./scandal-path-filter";

export default class NotesFileFilter extends ScandalPathFilter {
  dir: string;

  constructor(dir: string, options: Object = {}) {
    options.inclusions = ["*"];
    super(dir, options);

    this.dir = dir;
  }

  isAccepted(path: string) {
    return (
      super.isFileAccepted(path) &&
      !isSubDir(this.dir, path) &&
      isTextFile(path)
    );
  }
}

function isSubDir(dir: string, path: string) {
  return path.replace(dir + Path.sep, "").indexOf(Path.sep) > -1;
}

function isTextFile(path) {
  const extname = Path.extname(path);
  return !(
    fs.isCompressedExtension(extname) ||
    fs.isImageExtension(extname) ||
    fs.isPdfExtension(extname) ||
    fs.isBinaryExtension(extname)
  );
}
