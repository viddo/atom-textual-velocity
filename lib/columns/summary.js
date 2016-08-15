/* @flow */

import fs from 'fs-plus'
import R from 'ramda'

const MAX_PREVIEW_LENGTH = 400 // characters
const HIGHLIGHT_PREVIEW_PADDING = 20 // characters

export default class Summary {

  get id (): string {
    return 'summary'
  }

  get title (): string {
    return 'Summary'
  }

  get width (): number {
    return 70
  }

  get field (): string {
    return 'name'
  }

  cellContent (file: NotesFileType, res: RawSearchResultsType): CellContentType {
    const {sifterResult} = res
    const regex = R.path(['tokens', 0, 'regex'], sifterResult)
    return [this._title(file, regex), ' - ', this._preview(file, regex)]
  }

  _title (file: NotesFileType, regex: RegExp | void): Object {
    return {
      attrs: {
        className: this._iconClassForBasename(file),
        'data-name': file.name + file.ext,
        'data-path': file.path
      },
      content: [
        regex && this._highlightMatch(file.name, regex, MAX_PREVIEW_LENGTH) || file.name,
        {
          attrs: {className: 'text-subtle'},
          content: file.ext
        }
      ]
    }
  }

  _preview (file: NotesFileType, regex: RegExp | void): Object {
    const str = file.content || ''
    return {
      attrs: {className: 'text-subtle'},
      content: regex && this._highlightMatch(str, regex, HIGHLIGHT_PREVIEW_PADDING) || str.slice(0, MAX_PREVIEW_LENGTH)
    }
  }

  _highlightMatch (str: string, regex: RegExp, padding: number): CellContentType {
    const m = regex.exec(str)
    if (!m) return str

    const start = Math.max(0, m.index - padding)
    const highlightEnd = m.index + m[0].length
    const paddingBeforeMatch: string = (start > 0 ? '…' : '') + str.slice(start, m.index)
    const paddingAfterMatch: string = str.slice(highlightEnd, highlightEnd + MAX_PREVIEW_LENGTH - (highlightEnd - start))

    return [
      paddingBeforeMatch,
      {attrs: {className: 'text-highlight'}, content: m[0]},
      paddingAfterMatch
    ]
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
