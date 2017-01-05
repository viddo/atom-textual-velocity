/* @flow */

import * as actions from '../../lib/action-creators'
import selectedNoteReducer from '../../lib/reducers/selected-note'

describe('reducers/selected-note', () => {
  let action: Action
  let state: ?SelectedNote
  let nextConfig: Config
  let nextSifterResult: SifterResult
  let selectedNote: SelectedNote

  beforeEach(function () {
    nextConfig = {
      dir: '/notes',
      listHeight: 100,
      rowHeight: 25,
      sortDirection: 'desc',
      sortField: 'name'
    }
    nextSifterResult = {
      items: [],
      options: {
        fields: [],
        sort: []
      },
      query: '',
      tokens: [],
      total: 0
    }
    state = selectedNoteReducer(undefined, actions.startInitialScan(), nextConfig, nextSifterResult)
    selectedNote = {
      filename: 'foo',
      index: 42
    }
  })

  describe('when search', function () {
    beforeEach(function () {
      state = selectedNoteReducer(selectedNote, actions.search('abc'), nextConfig, nextSifterResult)
    })

    it('should reset selection', function () {
      expect(state).toBe(null)
    })
  })

  describe('when reset search', function () {
    beforeEach(function () {
      state = selectedNoteReducer(selectedNote, actions.search('abc'), nextConfig, nextSifterResult)
    })

    it('should reset selection', function () {
      expect(state).toBe(null)
    })
  })

  describe('when change active pane item', function () {
    describe('when matches a note', function () {
      beforeEach(function () {
        nextSifterResult.items = [
          {id: 'alice.md', score: 1},
          {id: 'bob.md', score: 1},
          {id: 'cesar.md', score: 1}
        ]
        state = selectedNoteReducer(selectedNote, actions.changedActivePaneItem('/notes/bob.md'), nextConfig, nextSifterResult)
      })

      it('should select matching item', function () {
        expect(state).toEqual({
          filename: 'bob.md',
          index: 1
        })
      })
    })

    describe('when is a non-note file', function () {
      beforeEach(function () {
        state = selectedNoteReducer(selectedNote, actions.changedActivePaneItem('foo'), nextConfig, nextSifterResult)
      })

      it('should unselect', function () {
        expect(state).toBe(null)
      })
    })
  })

  describe('when clicked row', function () {
    beforeEach(function () {
      nextSifterResult.items = [
        {id: 'alice.md', score: 1},
        {id: 'bob.md', score: 1},
        {id: 'cesar.md', score: 1}
      ]
      state = selectedNoteReducer(selectedNote, actions.clickRow('bob.md'), nextConfig, nextSifterResult)
    })

    it('should select matching item', function () {
      expect(state).toEqual({
        filename: 'bob.md',
        index: 1
      })
    })
  })

  describe('when change-sort-field action', function () {
    beforeEach(function () {
      action = actions.changeSortField('ext')
      nextSifterResult.items = [
        {id: 'bob.md', score: 1},
        {id: 'cesar.md', score: 1},
        {id: 'alice.txt', score: 1}
      ]
    })

    describe('when there is a selected note', function () {
      beforeEach(function () {
        selectedNote = {index: 0, filename: 'alice.txt'}
        state = selectedNoteReducer(selectedNote, action, nextConfig, nextSifterResult)
      })

      it('should update selected index', function () {
        expect(state).toEqual({
          index: 2,
          filename: 'alice.txt'
        })
      })
    })

    describe('when there is no selected note', function () {
      beforeEach(function () {
        state = selectedNoteReducer(undefined, action, nextConfig, nextSifterResult)
      })

      it('should not yield any selection', function () {
        expect(state).toBe(null)
      })
    })
  })

  describe('when change-sort-direction action', function () {
    beforeEach(function () {
      action = actions.changeSortDirection('desc')
      nextSifterResult.items = [
        {id: 'cesar.md', score: 1},
        {id: 'bob.md', score: 1},
        {id: 'alice.txt', score: 1}
      ]
    })

    describe('when there is a selected note', function () {
      beforeEach(function () {
        selectedNote = {index: 0, filename: 'alice.txt'}
        state = selectedNoteReducer(selectedNote, action, nextConfig, nextSifterResult)
      })

      it('should update selected index', function () {
        expect(state).toEqual({
          index: 2,
          filename: 'alice.txt'
        })
      })
    })

    describe('when there is no selected note', function () {
      beforeEach(function () {
        state = selectedNoteReducer(undefined, action, nextConfig, nextSifterResult)
      })

      it('should not yield any selection', function () {
        expect(state).toBe(null)
      })
    })
  })

  describe('when select next', function () {
    beforeEach(function () {
      action = actions.selectNext()
      nextSifterResult.items = [
        {id: 'alice.txt', score: 1},
        {id: 'bob.md', score: 1},
        {id: 'cesar.md', score: 1}
      ]
    })

    describe('when there is no selected note', function () {
      beforeEach(function () {
        state = selectedNoteReducer(undefined, action, nextConfig, nextSifterResult)
      })

      it('should select first item', function () {
        expect(state).toEqual({
          filename: 'alice.txt',
          index: 0
        })
      })

      it('should select next item until reaching end of list when called subsequently', function () {
        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        expect(state).toEqual({
          filename: 'bob.md',
          index: 1
        })

        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        expect(state).toEqual({
          filename: 'cesar.md',
          index: 2
        })

        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        expect(state).toEqual({
          filename: 'cesar.md',
          index: 2
        })
      })
    })
  })

  describe('when select prev', function () {
    beforeEach(function () {
      action = actions.selectPrev()
      nextSifterResult.items = [
        {id: 'alice.txt', score: 1},
        {id: 'bob.md', score: 1},
        {id: 'cesar.md', score: 1}
      ]
    })

    describe('when there is no selected note', function () {
      beforeEach(function () {
        state = selectedNoteReducer(undefined, action, nextConfig, nextSifterResult)
      })

      it('should select last item', function () {
        expect(state).toEqual({
          filename: 'cesar.md',
          index: 2
        })
      })

      it('should select prev item until reaching start of list when called subsequently', function () {
        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        expect(state).toEqual({
          filename: 'bob.md',
          index: 1
        })

        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        expect(state).toEqual({
          filename: 'alice.txt',
          index: 0
        })

        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        state = selectedNoteReducer(state, action, nextConfig, nextSifterResult)
        expect(state).toEqual({
          filename: 'alice.txt',
          index: 0
        })
      })
    })
  })

  describe('when called with other action', function () {
    describe('when there are items', function () {
      beforeEach(function () {
        nextSifterResult.items = [
          {id: 'foo', score: 1}
        ]
        state = selectedNoteReducer(selectedNote, actions.initialScanDone(), nextConfig, nextSifterResult)
      })

      it('should return state', function () {
        expect(state).toBe(selectedNote)
      })
    })

    describe('when there are not items', function () {
      beforeEach(function () {
        state = selectedNoteReducer(selectedNote, actions.initialScanDone(), nextConfig, nextSifterResult)
      })

      it('should return null', function () {
        expect(state).toBe(null)
      })
    })
  })
})
