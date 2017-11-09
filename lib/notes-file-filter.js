/* @flow */

import Path from "path";
import fs from "fs-plus";
import ScandalPathFilter from "./scandal-path-filter";

export default class NotesFileFilter extends ScandalPathFilter {
  dir: string;

  constructor(dir: string, options: Object = {}) {
    options.inclusions = ["*"];
    super(dir, options);

    this.dir = dir;
  }

  isAccepted(rawFile: RawFile) {
    const path = Path.join(this.dir, rawFile.filename);
    return super.isFileAccepted(path) && isTextFile(path);
  }
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
