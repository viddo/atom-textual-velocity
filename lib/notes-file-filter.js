/* @flow */

import Path from "path";
import fs from "fs-plus";
import ScandalPathFilter from "./scandal-path-filter";

export default class NotesFileFilter extends ScandalPathFilter {
  constructor(path: string, options: Object = {}) {
    options.inclusions = ["*"];
    super(path, options);
  }

  isAccepted(path: string) {
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
