'use babel'

import FileField from '../../lib/fields/file-field'

describe('fields/file-field', function () {
  let field: FieldType

  describe('.name', function () {
    it('should return given name', function () {
      field = new FileField({name: 'a-name', propPath: ''})
      expect(field.name).toEqual('a-name')
    })
  })

  describe('.value', function () {
    it('should return the value of the given prop path', function () {
      field = new FileField({name: 'a-name', propPath: 'name'})
      expect(field.value({name: 'test'})).toEqual('test')

      field = new FileField({name: 'a-name', propPath: 'data.stats.birthtime'})
      expect(field.value({data: {stats: {birthtime: 123}}})).toEqual(123)
      expect(field.value({data: {}})).toBeUndefined()
      expect(field.value({})).toBeUndefined()
      expect(field.value(null)).toBeUndefined()
    })
  })
})
