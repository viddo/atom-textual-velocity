'use babel'

import fs from 'fs-plus'

const MAX_PREVIEW_LENGTH = 400 // characters

export default class Summary {

  get id () {
    return 'summary'
  }

  get title () {
    return 'Summary'
  }

  get width () {
    return 70
  }

  get field () {
    return 'name'
  }

  cellContent (file) {
    return [this._title(file), ' - ', this._contentPreview(file)]
  }

  _title (file) {
    return {
      attrs: {
        className: this._iconClassForBasename(file),
        'data-name': file.name + file.ext,
        'data-path': file.path
      },
      content: [
        file.name,
        {
          attrs: {className: 'text-subtle'},
          content: file.ext
        }
      ]
    }
  }

  _contentPreview (file) {
    return {
      attrs: {className: 'text-subtle'},
      content: file.content && file.content.slice(0, MAX_PREVIEW_LENGTH)
    }
  }

  _iconClassForBasename (file) {
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
