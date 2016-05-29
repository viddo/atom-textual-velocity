'use babel'

import ListPagination from '../../lib/value-objects/list-pagination'

describe('value-objects/list-pagination', () => {
  describe('.visibleCount', function () {
    it('should return visible count of items within the list height', function () {
      let pagination = new ListPagination({listHeight: 100, itemHeight: 20})
      expect(pagination.visibleCount).toEqual(5)
    })

    it('should round up even if last item is only partly visible', function () {
      let pagination = new ListPagination({listHeight: 173, itemHeight: 21})
      expect(pagination.visibleCount).toEqual(9)
    })
  })
})
