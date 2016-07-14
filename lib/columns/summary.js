'use babel'

import fs from 'fs-plus'
import R from 'ramda'

const MAX_PREVIEW_LENGTH = 400 // characters
const HIGHLIGHT_PREVIEW_PADDING = 20 // characters

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

  cellContent (file, {sifterResult}) {
    const regex = R.path(['tokens', 0, 'regex'], sifterResult)
    return [this._title(file, regex), ' - ', this._contentPreview(file, regex)]
  }

  _title (file, regex) {
    return {
      attrs: {
        className: this._iconClassForBasename(file),
        'data-name': file.name + file.ext,
        'data-path': file.path
      },
      content: [
        regex && this._highlightMatch(file.name, regex) || file.name,
        {
          attrs: {className: 'text-subtle'},
          content: file.ext
        }
      ]
    }
  }

  _contentPreview (file, regex) {
    const preview = file.content && file.content.slice(0, MAX_PREVIEW_LENGTH)
    return {
      attrs: {className: 'text-subtle'},
      content: regex && this._highlightMatch(preview, regex, HIGHLIGHT_PREVIEW_PADDING) || preview
    }
  }

  _highlightMatch (str, regex, padding = MAX_PREVIEW_LENGTH) {
    const m = regex.exec(str)
    if (!m) return str

    const start = Math.max(0, m.index - padding)
    const highlightEnd = m.index + m[0].length

    return [
      (start > 0 ? '…' : '') + str.slice(start, m.index),
      {attrs: {className: 'text-highlight'}, content: m[0]},
      str.slice(highlightEnd, highlightEnd + MAX_PREVIEW_LENGTH - (highlightEnd - start)),
    ]
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
