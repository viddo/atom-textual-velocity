/* @flow */

import * as actions from '../../lib/action-creators'
import scrollTopReducer from '../../lib/reducers/scroll-top'

describe('scroll-top reducer', () => {
  let state: any
  let config: Config
  let selected: Selected

  beforeEach(function () {
    state = undefined
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
      state = scrollTopReducer(state, actions.search('abc'), config, selected)
    })

    it('should force scrollTop to top', function () {
      expect(state).toEqual(0)
    })
  })

  describe('when reset search', function () {
    beforeEach(function () {
      state = scrollTopReducer(state, actions.resetSearch(), config, selected)
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
      state = 123
      state = scrollTopReducer(state, actions.startInitialScan(), config, selected)
    })

    it('should return current scrollTop', function () {
      expect(state).toEqual(123)
    })
  })

  function sharedAdjustScrollTopSpecs (action: Action) {
    describe('when there is no selection', function () {
      beforeEach(function () {
        selected = null
        state = 5
        state = scrollTopReducer(state, action, config, selected)
      })

      it('should return current scrollTop', function () {
        expect(state).toEqual(5)
      })
    })

    describe('when selected item is within the viewport', function () {
      beforeEach(function () {
        selected = {index: 5, filename: 'alice.txt'}
        state = 25
        state = scrollTopReducer(state, action, config, selected)
      })

      it('should return current scrollTop', function () {
        expect(state).toEqual(25)
      })
    })

    describe('when selected item is before the viewport', function () {
      beforeEach(function () {
        selected = {index: 1, filename: 'alice.txt'}
        state = 25
        state = scrollTopReducer(state, action, config, selected)
      })

      it('should force scrollTop to have the selected item in view at top', function () {
        expect(state).toEqual(20)
      })
    })

    describe('when selected item is after the viewport', function () {
      beforeEach(function () {
        selected = {index: 20, filename: 'alice.txt'}
        state = scrollTopReducer(state, action, config, selected)
      })

      it('should force scrollTop to have the selected item at the bottom of the viewport', function () {
        expect(state).toEqual(320) // 400 - 80 (the height of the other items before the selected)
      })
    })

    describe('when selected item is only half visible at the end of the viewport', function () {
      beforeEach(function () {
        state = 5
        selected = {index: 5, filename: 'alice.txt'}
        state = scrollTopReducer(state, action, config, selected)
      })

      it('should force scrollTop to have the selected item at the bottom of the viewport', function () {
        expect(state).toEqual(20)
      })
    })

    describe('when selected item is only half visible at the top of the viewport', function () {
      beforeEach(function () {
        state = 25
        selected = {index: 1, filename: 'alice.txt'}
        state = scrollTopReducer(state, action, config, selected)
      })

      it('should force scrollTop to have the selected item at the top of the viewport', function () {
        expect(state).toEqual(20)
      })
    })
  }
})
