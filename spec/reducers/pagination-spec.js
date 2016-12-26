/* @flow */

import * as actions from '../../lib/action-creators'
import paginationReducer from '../../lib/reducers/pagination'

describe('pagination reducer', () => {
  let nextConfig, nextScrollTop, state, prevState

  beforeEach(function () {
    nextConfig = {
      dir: '',
      listHeight: 1000,
      rowHeight: 24,
      sortDirection: 'desc',
      sortField: ''
    }

    nextScrollTop = 50

    state = paginationReducer(state, actions.startInitialScan(), nextConfig, nextScrollTop)
  })

  it('should set some defaults', function () {
    expect(state.start).toEqual(0)
    expect(state.limit).toEqual(0)
  })

  describe('when irrelevant action', function () {
    beforeEach(function () {
      prevState = state
      state = paginationReducer(state, actions.startInitialScan(), nextConfig, nextScrollTop)
    })

    it('should keep prev state', function () {
      expect(state).toBe(prevState)
    })
  })

  describe('when scrolled action', function () {
    sharedPaginationCalculationSpecs(actions.scroll(nextScrollTop))
  })

  describe('when select note', function () {
    sharedPaginationCalculationSpecs(actions.selectNote({index: 0, filename: ''}))
  })

  describe('when reset search', function () {
    sharedPaginationCalculationSpecs(actions.resetSearch())
  })

  describe('when search', function () {
    sharedPaginationCalculationSpecs(actions.search('abc'))
  })

  describe('when changed sort field', function () {
    sharedPaginationCalculationSpecs(actions.changeSortField('ext'))
  })

  describe('when changed sort direction', function () {
    sharedPaginationCalculationSpecs(actions.changeSortDirection('asc'))
  })

  describe('when changed list height', function () {
    sharedPaginationCalculationSpecs(actions.changeListHeight(123))
  })

  describe('when resized list', function () {
    sharedPaginationCalculationSpecs(actions.resizeList(123))
  })

  describe('when changed row height', function () {
    sharedPaginationCalculationSpecs(actions.changeRowHeight(25))
  })

  describe('when initial scan is done', function () {
    sharedPaginationCalculationSpecs(actions.initialScanDone())
  })

  function sharedPaginationCalculationSpecs (action: Action) {
    beforeEach(function () {
      state = paginationReducer(state, action, nextConfig, nextScrollTop)
    })

    it('should update values', function () {
      expect(state.start).toEqual(2) // 2,5, rounded down
      expect(state.limit).toEqual(43) // 41, +2 for visible padding
    })
  }
})
