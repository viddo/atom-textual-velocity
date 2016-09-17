/* @flow */

import fs from 'fs-plus'

export default class FileIconColumn {

  _sortField: string

  constructor (params: {sortField: string}) {
    this._sortField = params.sortField
  }

  get sortField (): string {
    return this._sortField
  }

  get title (): string {
    return ''
  }

  get description (): string {
    return 'File extension'
  }

  get width (): number {
    return 2
  }

  cellContent (file: NotesFileType): CellContentType {
    return {
      attrs: {
        className: this._iconClassForBasename(file),
        'data-name': file.base
      }
    }
  }

  _iconClassForBasename (file: NotesFileType) {
    // from https://github.com/atom/tree-view/blob/9dcc89fc0c8505528f393b5ebdd93616a8adbd68/lib/default-file-icons.coffee
    if (fs.isSymbolicLinkSync(file.path)) {
      return 'icon icon-file-symlink-file'
    } else if (fs.isReadmePath(file.path)) {
      return 'icon icon-book'
    } else if (fs.isCompressedExtension(file.ext)) {
      return 'icon icon-file-zip'
    } else if (fs.isImageExtension(file.ext)) {
      return 'icon icon-file-media'
    } else if (fs.isPdfExtension(file.ext)) {
      return 'icon icon-file-pdf'
    } else if (fs.isBinaryExtension(file.ext)) {
      return 'icon icon-file-binary'
    } else {
      return 'icon icon-file-text'
    }
  }
}
