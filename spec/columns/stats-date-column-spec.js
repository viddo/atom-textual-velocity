'use babel'

import NotesFile from '../../lib/notes-file'
import StatsDateColumn from '../../lib/columns/stats-date-column'

describe('columns/stats-date-column', function () {
  let column: ColumnType

  beforeEach(function () {
    column = new StatsDateColumn({
      sortField: 'created-date',
      title: 'Created date',
      filePropName: 'birthtime'
    })
  })

  describe('.sortField', function () {
    it('should return sort field', function () {
      expect(column.sortField).toEqual('created-date')
    })
  })

  describe('.title', function () {
    it('should return title', function () {
      expect(column.title).toEqual('Created date')
    })
  })

  describe('.cellContent', function () {
    let file

    beforeEach(function () {
      file = new NotesFile('markdown.md', relPath => `/notes/${relPath}`)
    })

    it('should return an empty string if there is no date for given prop', function () {
      expect(column.cellContent(file)).toEqual('')
    })

    it('should return diffing time from now', function () {
      file.stats = {birthtime: new Date()}
      expect(column.cellContent(file)).toEqual(jasmine.any(String))
      expect(column.cellContent(file)).not.toEqual('')
    })
  })
})
