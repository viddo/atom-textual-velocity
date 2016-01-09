'use babel'

import { prev, next } from '../lib/get-index'

describe('getIndex', function () {
  describe('.prev', function () {
    it('returns the last index when there is no current index', function () {
      expect(prev(123)).toEqual(122)
      expect(prev(123, undefined)).toEqual(122)
      expect(prev(123, null)).toEqual(122)
    })

    it('stops at first index', function () {
      expect(prev(123, 0)).toEqual(0)
    })

    it('returns the prev index while within the total range', function () {
      expect(prev(123, 1)).toEqual(0)
      expect(prev(123, 51)).toEqual(50)
      expect(prev(123, 122)).toEqual(121)
    })

    it('returns closest within-range index when out of range', function () {
      expect(prev(123, -9000)).toEqual(0)
      expect(prev(123, -1)).toEqual(0)
      expect(prev(123, 123)).toEqual(122)
      expect(prev(123, 9000)).toEqual(122)
    })
  })

  describe('.next', function () {
    it('returns the first index when there is no current index', function () {
      expect(next(123)).toEqual(0)
      expect(next(123, undefined)).toEqual(0)
      expect(next(123, null)).toEqual(0)
    })

    it('stops at the last index', function () {
      expect(next(123, 122)).toEqual(122)
    })

    it('returns the next index while within the total range', function () {
      expect(next(123, 0)).toEqual(1)
      expect(next(123, 51)).toEqual(52)
      expect(next(123, 121)).toEqual(122)
    })

    it('stops at the closest within-range index when out of range', function () {
      expect(next(123, -9000)).toEqual(0)
      expect(next(123, -1)).toEqual(0)
      expect(next(123, 123)).toEqual(122)
      expect(next(123, 9000)).toEqual(122)
    })
  })
})
