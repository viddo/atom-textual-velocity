'use babel'

import DateColumn from '../lib/columns/date-column'
import Summary from '../lib/columns/summary'

const columns = [{
  name: 'DateColumn',
  column: new DateColumn({
    id: 'id',
    title: 'title',
    field: 'atime'
  })
}, {
  name: 'Summary',
  column: new Summary()
}]

describe('columns', function () {
  beforeEach(function () {
    this.file = {
      path: 'foo/bar.md',
      content: 'beep boop',
      atime: new Date().getTime()
    }
    this.renderResults = {}
  })

  columns.forEach(({name, column}) => {
    describe(name, function () {
      it('should have a some compulsory props', function () {
        expect(column.id).toEqual(jasmine.any(String))
        expect(column.title).toEqual(jasmine.any(String))
        expect(column.width).toEqual(jasmine.any(Number))
        expect(column.field).toEqual(jasmine.any(String))
      })

      it('should have a cellContent', function () {
        const cellContent = column.cellContent(this.file, this.renderResults)
        expect(typeof cellContent === 'string' || cellContent instanceof Array).toBe(true)
      })
    })
  })
})
