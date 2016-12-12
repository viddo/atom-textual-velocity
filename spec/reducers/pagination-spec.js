/* @flow */

import {scroll} from '../../lib/action-creators'
import paginationReducer from '../../lib/reducers/pagination'

describe('pagination reducer', () => {
  let config, state

  describe('when scrolled action', function () {
    beforeEach(function () {
      config = {
        dir: '',
        listHeight: 1000,
        rowHeight: 20,
        sortDirection: 'desc',
        sortField: ''
      }
      state = {
        start: 0,
        limit: 50
      }
      state = paginationReducer(state, scroll(50), config)
    })

    it('should update start value', function () {
      expect(state.start).toEqual(2)
      expect(state.limit).toEqual(50)
    })
  })
})
