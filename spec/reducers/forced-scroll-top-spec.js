/* @flow */

import * as actions from '../../lib/action-creators'
import forcedScrollTopReducer from '../../lib/reducers/forced-scroll-top'

describe('forced scrollTop reducer', () => {
  let state: ?number
  let config: Config
  let scrollTop: number
  let selected: Selected

  beforeEach(function () {
    state = undefined
    scrollTop = 100
    selected = null
    config = {
      dir: '',
      listHeight: 100,
      rowHeight: 20,
      sortDirection: 'desc',
      sortField: 'name'
    }
  })

  describe('when search', function () {
    beforeEach(function () {
      state = forcedScrollTopReducer(state, actions.search('abc'), scrollTop, config, selected)
    })

    it('should force scrollTop to top', function () {
      expect(state).toEqual(0)
    })
  })

  describe('when reset search', function () {
    beforeEach(function () {
      state = forcedScrollTopReducer(state, actions.resetSearch(), scrollTop, config, selected)
    })

    it('should force scrollTop to top', function () {
      expect(state).toEqual(0)
    })
  })

  describe('when changed row height', function () {
    sharedAdjustScrollTopSpecs(actions.changeRowHeight(25))
  })

  describe('when changed list height', function () {
    sharedAdjustScrollTopSpecs(actions.changeListHeight(123))
  })

  describe('when changed sort field', function () {
    sharedAdjustScrollTopSpecs(actions.changeSortField('ext'))
  })

  describe('when changed sort direction', function () {
    sharedAdjustScrollTopSpecs(actions.changeSortDirection('asc'))
  })

  describe('when select prev note', function () {
    sharedAdjustScrollTopSpecs(actions.selectPrevNote())
  })

  describe('when select next note', function () {
    sharedAdjustScrollTopSpecs(actions.selectNextNote())
  })

  describe('when any other action', function () {
    beforeEach(function () {
      state = forcedScrollTopReducer(state, actions.startInitialScan(), scrollTop, config, selected)
    })

    it('should not force scrollTop', function () {
      expect(state).toBe(null)
    })
  })

  function sharedAdjustScrollTopSpecs (action: Action) {
    describe('when there is no selection', function () {
      beforeEach(function () {
        state = forcedScrollTopReducer(state, action, scrollTop, config, selected)
      })

      it('should not force scrollTop', function () {
        expect(state).toBe(null)
      })
    })

    describe('when selected item is within the viewport', function () {
      beforeEach(function () {
        selected = {index: 5, filename: 'alice.txt'}
        state = forcedScrollTopReducer(state, action, scrollTop, config, selected)
      })

      it('should not force scrollTop', function () {
        expect(state).toBe(null)
      })
    })

    describe('when selected item is before the viewport', function () {
      beforeEach(function () {
        selected = {index: 1, filename: 'alice.txt'}
        state = forcedScrollTopReducer(state, action, scrollTop, config, selected)
      })

      it('should force scrollTop to have the selected item in view at top', function () {
        expect(state).toEqual(20)
      })
    })

    describe('when selected item is after the viewport', function () {
      beforeEach(function () {
        selected = {index: 20, filename: 'alice.txt'}
        state = forcedScrollTopReducer(state, action, scrollTop, config, selected)
      })

      it('should force scrollTop to have the selected item at the bottom of the viewport', function () {
        expect(state).toEqual(320) // 400 - 80 (the height of the other items before the selected)
      })
    })

    describe('when selected item is only half visible at the end of the viewport', function () {
      beforeEach(function () {
        scrollTop = 5
        selected = {index: 5, filename: 'alice.txt'}
        state = forcedScrollTopReducer(state, action, scrollTop, config, selected)
      })

      it('should force scrollTop to have the selected item at the bottom of the viewport', function () {
        expect(state).toEqual(20)
      })
    })

    describe('when selected item is only half visible at the top of the viewport', function () {
      beforeEach(function () {
        scrollTop = 25
        selected = {index: 1, filename: 'alice.txt'}
        state = forcedScrollTopReducer(state, action, scrollTop, config, selected)
      })

      it('should force scrollTop to have the selected item at the top of the viewport', function () {
        expect(state).toEqual(20)
      })
    })
  }
})
