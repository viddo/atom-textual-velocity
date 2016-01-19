'use babel'

import getResult from '../../lib/tasks/get-result'

describe('getResult', function () {
  let results
  const items = [
    {path: '/foo'},
    {path: '/bar'},
    {path: '/baz'},
    {path: '/pax'}
  ]

  describe('when there are some results', function () {
    beforeEach(function () {
      const query = {
        searchStr: '',
        paginationOffset: 1,
        paginationSize: 2
      }
      const queryResults = {
        total: 2,
        tokens: [],
        items: [
          {id: 0},
          {id: 1},
          {id: 2},
          {id: 3}
        ]
      }
      results = getResult(query, queryResults, items)
    })

    it('results has correct total', function () {
      expect(results.total).toEqual(2)
    })

    it('results has expected items', function () {
      expect(results.items.length).toEqual(2)
    })

    it('results items have hrtime when item was created', function () {
      expect(results.items[0].hrtime).toBeDefined()
    })
  })
})
