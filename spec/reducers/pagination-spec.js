/* @flow */

import {scroll, changeListHeight, resizeList, startInitialScan} from '../../lib/action-creators'
import paginationReducer from '../../lib/reducers/pagination'

describe('pagination reducer', () => {
  let config, state

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
  })

  describe('when scrolled action', function () {
    beforeEach(function () {
      state = paginationReducer(state, scroll(50), config)
    })

    it('should update start value', function () {
      expect(state.start).toEqual(2)
      expect(state.limit).toEqual(50)
    })
  })

  describe('when changed list height', function () {
    beforeEach(function () {
      config.listHeight = 60
      state = paginationReducer(state, changeListHeight(config.listHeight), config)
    })

    it('should update limit', function () {
      expect(state.start).toEqual(0)
      expect(state.limit).toEqual(5) // 3 + visible padding
    })
  })

  describe('when resized list', function () {
    beforeEach(function () {
      config.listHeight = 60
      state = paginationReducer(state, resizeList(config.listHeight), config)
    })

    it('should update limit', function () {
      expect(state.start).toEqual(0)
      expect(state.limit).toEqual(5) // 3 + visible padding
    })
  })

  describe('when other random action', function () {
    let prevState

    beforeEach(function () {
      prevState = state
      state = paginationReducer(state, startInitialScan(), config)
    })

    it('should keep prev state', function () {
      expect(state).toBe(prevState)
    })
  })
})
