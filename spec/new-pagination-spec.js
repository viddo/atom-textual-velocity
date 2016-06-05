'use babel'

import newPagination from '../lib/new-pagination'

describe('.new-pagination', function () {
  it('should return a pagination object with start and limit', function () {
    expect(newPagination({listHeight: 100, rowHeight: 20})).toEqual({start: 0, limit: 7})
    expect(newPagination({listHeight: 81, rowHeight: 20})).toEqual({start: 0, limit: 6})
    expect(newPagination({scrollTop: 242, listHeight: 100, rowHeight: 20})).toEqual({start: 12, limit: 7})
  })
})
