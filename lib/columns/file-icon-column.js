/* @flow */

import fs from "fs-plus";

export default class FileIconColumn {
  description: string;
  sortField: string;
  title: string;
  width: number;

  constructor(params: { sortField: string }) {
    this.description = "File extension";
    this.sortField = params.sortField;
    this.title = "File type";
    this.width = 4;
  }

  cellContent(params: CellContentParams): CellContent {
    const { note } = params;
    return {
      attrs: {
        className: note.fileIcons || this._defaultFileIcons(params.path, note),
        "data-name": note.name + note.ext
      }
    };
  }

  _defaultFileIcons(path: string, note: Note) {
    // from https://github.com/atom/tree-view/blob/9dcc89fc0c8505528f393b5ebdd93616a8adbd68/lib/default-file-icons.coffee
    if (fs.isSymbolicLinkSync(path)) {
      return "icon icon-file-symlink-file";
    } else if (fs.isReadmePath(path)) {
      return "icon icon-book";
    } else if (fs.isCompressedExtension(note.ext)) {
      return "icon icon-file-zip";
    } else if (fs.isImageExtension(note.ext)) {
      return "icon icon-file-media";
    } else if (fs.isPdfExtension(note.ext)) {
      return "icon icon-file-pdf";
    } else if (fs.isBinaryExtension(note.ext)) {
      return "icon icon-file-binary";
    } else {
      return "icon icon-file-text";
    }
  }
}
