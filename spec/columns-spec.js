/* @flow */

import Columns from '../lib/columns'

describe('columns', () => {
  let columns

  beforeEach(function () {
    atom.config.setSchema('textual-velocity.sortField', {
      type: 'string'
    })
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

    it('should update sortField schema', function () {
      let schema = atom.config.getSchema('textual-velocity.sortField')
      expect(schema).toEqual({
        type: 'string',
        default: 'test-field',
        enum: [
          {value: 'test-field', description: 'test'}
        ]
      })

      columns.add({
        sortField: 'test-field2',
        title: 'another field',
        description: 'A second test column',
        width: 50,
        cellContent: () => 'some other content'
      })

      schema = atom.config.getSchema('textual-velocity.sortField')
      expect(schema).toEqual({
        type: 'string',
        default: 'test-field',
        enum: [
          {value: 'test-field', description: 'test'},
          {value: 'test-field2', description: 'another field'}
        ]
      })
    })

    it('should return all fields that have been added', function () {
      expect(columns.all()).toEqual(jasmine.any(Array))
      expect(columns.all().length).toEqual(1)
      expect(columns.all()[0].title).toEqual('test')
    })
  })
})
