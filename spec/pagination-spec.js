'use babel'

import {start, limit} from '../lib/pagination'

describe('pagination', function () {
  describe('.start', function () {
    it('should return a pagination object with start and limit', function () {
      expect(start({scrollTop: 0, rowHeight: 20})).toEqual(0)
      expect(start({scrollTop: 242, rowHeight: 20})).toEqual(12)
    })
  })

  describe('.limit', function () {
    it('should return limit', function () {
      expect(limit({listHeight: 100, rowHeight: 20})).toEqual(7)
      expect(limit({listHeight: 81, rowHeight: 20})).toEqual(6)
    })
  })
})
