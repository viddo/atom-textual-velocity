/* @flow */

import Columns from '../lib/columns'

describe('columns', () => {
  let columns

  beforeEach(function () {
    columns = new Columns()
  })

  describe('.all', function () {
    beforeEach(function () {
      columns.add({
        sortField: 'test-field',
        title: 'test',
        description: 'A test column',
        width: 50,
        cellContent: () => 'some content'
      })
    })

    it('should return all fields that have been added', function () {
      expect(columns.all()).toEqual(jasmine.any(Array))
      expect(columns.all().length).toEqual(1)
      expect(columns.all()[0].title).toEqual('test')
    })
  })
})
