/* @flow */

import * as actions from '../../lib/action-creators'
import selectedReducer from '../../lib/reducers/selected'

describe('selected reducer', () => {
  let state: Selected
  let items: Array<SifterResultItem>

  beforeEach(function () {
    state = undefined
    items = [
      {id: 'alice.txt', score: 1},
      {id: 'bob.md', score: 0.9},
      {id: 'cesar.md', score: 0.8}
    ]
  })

  describe('when search', function () {
    beforeEach(function () {
      state = selectedReducer(state, actions.search('abc'), items)
    })

    it('should reset selection', function () {
      expect(state).toBe(null)
    })
  })

  describe('when reset search', function () {
    beforeEach(function () {
      state = selectedReducer(state, actions.resetSearch(), items)
    })

    it('should reset selection', function () {
      expect(state).toBe(null)
    })
  })

  describe('when select prev note action', function () {
    describe('when there are no items', function () {
      beforeEach(function () {
        items = []
        state = selectedReducer(state, actions.selectPrevNote(), items)
      })

      it('should reset selection', function () {
        expect(state).toBe(null)
      })
    })

    describe('when there is no selection', function () {
      beforeEach(function () {
        state = selectedReducer(state, actions.selectPrevNote(), items)
      })

      it('should start at last item', function () {
        expect(state).toEqual({index: 2, filename: 'cesar.md'})
      })

      it('should step back but stop at first item when called subsequently', function () {
        state = selectedReducer(state, actions.selectPrevNote(), items)
        expect(state).toEqual({index: 1, filename: 'bob.md'})

        state = selectedReducer(state, actions.selectPrevNote(), items)
        expect(state).toEqual({index: 0, filename: 'alice.txt'})

        state = selectedReducer(state, actions.selectPrevNote(), items)
        expect(state).toEqual({index: 0, filename: 'alice.txt'})
      })
    })
  })

  describe('when select next note action', function () {
    describe('when there are no items', function () {
      beforeEach(function () {
        items = []
        state = selectedReducer(state, actions.selectNextNote(), items)
      })

      it('should reset selection', function () {
        expect(state).toBe(null)
      })
    })

    describe('when there is no selection', function () {
      beforeEach(function () {
        state = selectedReducer(state, actions.selectNextNote(), items)
      })

      it('should start at first item', function () {
        expect(state).toEqual({index: 0, filename: 'alice.txt'})
      })

      it('should step forward but stop at last item when called subsequently', function () {
        state = selectedReducer(state, actions.selectNextNote(), items)
        expect(state).toEqual({index: 1, filename: 'bob.md'})

        state = selectedReducer(state, actions.selectNextNote(), items)
        expect(state).toEqual({index: 2, filename: 'cesar.md'})

        state = selectedReducer(state, actions.selectNextNote(), items)
        expect(state).toEqual({index: 2, filename: 'cesar.md'})
      })
    })
  })

  describe('when change sort field', function () {
    beforeEach(function () {
      items = [
        {id: 'bob.md', score: 0.9},
        {id: 'alice.txt', score: 1},
        {id: 'cesar.md', score: 0.8}
      ]
    })

    it('should update selected index if there is a selection', function () {
      state = {index: 0, filename: 'alice.txt'}
      state = selectedReducer(state, actions.changeSortField('other'), items)
      expect(state).toEqual({index: 1, filename: 'alice.txt'})

      state = null
      expect(state).toBe(null)
    })
  })

  describe('when change sort direction', function () {
    beforeEach(function () {
      items = [
        {id: 'cesar.md', score: 0.8},
        {id: 'bob.md', score: 0.9},
        {id: 'alice.txt', score: 1}
      ]
    })

    it('should update selected index if there is a selection', function () {
      state = {index: 0, filename: 'alice.txt'}
      state = selectedReducer(state, actions.changeSortDirection('desc'), items)
      expect(state).toEqual({index: 2, filename: 'alice.txt'})

      state = null
      expect(state).toBe(null)
    })
  })

  describe('when called with other action', function () {
    let prevState

    beforeEach(function () {
      prevState = {index: 0, filename: 'alice.txt'}
      state = selectedReducer(prevState, actions.initialScanDone(), items)
    })

    it('should return state', function () {
      expect(state).toBe(prevState)
    })
  })
})
