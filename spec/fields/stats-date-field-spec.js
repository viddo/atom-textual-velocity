'use babel'

import StatsDateField from '../../lib/fields/stats-date-field'

describe('fields/stats-date-field', function () {
  let field: FieldType

  describe('.filePropName', function () {
    it('should return given name', function () {
      field = new StatsDateField({filePropName: 'a-name', statsPropName: 'birthtime'})
      expect(field.filePropName).toEqual('a-name')
    })
  })

  describe('.value', function () {
    it('should return the value of the given prop path', function () {
      field = new StatsDateField({filePropName: 'a-name', statsPropName: 'birthtime'})
      expect(field.value({stats: {birthtime: new Date()}})).toEqual(jasmine.any(Number))
      expect(field.value({stats: {other: new Date()}})).toBeUndefined()

      field = new StatsDateField({filePropName: 'a-name', statsPropName: 'other'})
      expect(field.value({stats: {birthtime: new Date()}})).toBeUndefined()
    })
  })
})
