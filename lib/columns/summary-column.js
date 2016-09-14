/* @flow */

import fs from 'fs-plus'

const MAX_PREVIEW_LENGTH = 400 // characters
const HIGHLIGHT_PREVIEW_PADDING_LENGTH = 20 // characters

export default class SummaryColumn {

  _sortField: string

  constructor (params: {sortField: string}) {
    this._sortField = params.sortField
  }

  get sortField (): string {
    return this._sortField
  }

  get title (): string {
    return 'Summary'
  }

  get description (): string {
    return 'File name and content preview'
  }

  get width (): number {
    return 50
  }

  get editCellName (): string | void {
    return 'base'
  }

  editCellStr (file: NotesFileType): string {
    return file.base
  }

  cellContent (file: NotesFileType, searchMatch?: SearchMatchType): CellContentType {
    return [this._title(file, searchMatch), ' - ', this._preview(file, searchMatch)]
  }

  _title (file: NotesFileType, searchMatch?: SearchMatchType): Object {
    return {
      attrs: {
        className: this._iconClassForBasename(file),
        'data-name': file.name + file.ext,
        'data-path': file.path
      },
      content: [
        searchMatch && searchMatch.content(file.name) || file.name,
        {
          attrs: {className: 'text-subtle'},
          content: file.ext
        }
      ]
    }
  }

  _preview (file: NotesFileType, searchMatch?: SearchMatchType): Object {
    const str = file.data.content
    let content

    if (str) {
      content = searchMatch && searchMatch.content(str)
      if (content) {
        const highlightStart = str.indexOf(content[1].content)
        const highlightEnd = content[1].content.length
        const start = Math.max(0, highlightStart - HIGHLIGHT_PREVIEW_PADDING_LENGTH)
        content[0] = (start > 0 ? '…' : '') + content[0].slice(start, highlightStart)
        content[2] = content[2].slice(0, Math.max(0, MAX_PREVIEW_LENGTH - (highlightStart + highlightEnd)))
      }
    }

    return {
      attrs: {className: 'text-subtle'},
      content: content || str && str.slice(0, MAX_PREVIEW_LENGTH)
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
