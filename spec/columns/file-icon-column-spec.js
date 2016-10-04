'use babel'

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
    let note, path, cellContent

    beforeEach(function () {
      path = '/notes/markdown.md'
      note = {
        id: '',
        name: 'markdown',
        ext: '.md'
      }
      cellContent = column.cellContent({note: note, path: path})
    })

    it('should return a kind of AST from which a DOM can be created', function () {
      expect(cellContent).toEqual(jasmine.any(Object), 'title')
      expect(cellContent.attrs).toEqual({
        className: 'icon icon-file-text',
        'data-name': 'markdown.md'
      })
    })
  })
})
