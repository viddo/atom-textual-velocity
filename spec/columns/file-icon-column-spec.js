'use babel'

import NotesFile from '../../lib/notes-file'
import FileIconColumn from '../../lib/columns/file-icon-column'

describe('columns/file-icon-column', function () {
  let column: ColumnType

  beforeEach(function () {
    column = new FileIconColumn({sortField: 'ext'})
  })

  describe('.sortField', function () {
    it('should return given sort field value', function () {
      expect(column.sortField).toEqual('ext')
    })
  })

  describe('.cellContent', function () {
    let file, cellContent

    beforeEach(function () {
      file = new NotesFile('markdown.md', relPath => `/notes/${relPath}`)
      cellContent = column.cellContent(file)
    })

    it('should return a kind of AST from which a DOM can be created', function () {
      expect(cellContent).toEqual(jasmine.any(Object), 'title')
      expect(cellContent.attrs).toEqual({
        title: 'File extension: .md',
        className: 'icon icon-file-text',
        'data-name': 'markdown.md',
        'data-path': '/notes/markdown.md'
      })
      expect(cellContent.content).toEqual(jasmine.any(String))
    })
  })
})
