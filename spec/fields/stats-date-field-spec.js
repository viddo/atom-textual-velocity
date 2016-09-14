'use babel'

import StatsDateField from '../../lib/fields/stats-date-field'

describe('fields/stats-date-field', function () {
  let field: FieldType

  describe('.name', function () {
    it('should return given name', function () {
      field = new StatsDateField({name: 'a-name', prop: ''})
      expect(field.name).toEqual('a-name')
    })
  })

  describe('.value', function () {
    it('should return the value of the given prop path', function () {
      field = new StatsDateField({name: 'a-name', prop: 'birthtime'})
      expect(field.value({data: {stats: {birthtime: new Date()}}})).toEqual(jasmine.any(Number))
      expect(field.value({data: {stats: {other: new Date()}}})).toBeUndefined()

      field = new StatsDateField({name: 'a-name', prop: 'other'})
      expect(field.value({data: {stats: {birthtime: new Date()}}})).toBeUndefined()
    })
  })
})
