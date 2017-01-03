/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import keyPressEpic, {ENTER, ESC} from '../../lib/epics/key-press'
import * as actions from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(keyPressEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('epics/key-press', () => {
  let state: State
  let store
  let event: KeyPressEvent

  beforeEach(() => {
    state = {
      columnHeaders: [],
      config: {
        dir: '/notes',
        listHeight: 75,
        rowHeight: 25,
        sortDirection: 'asc',
        sortField: 'name'
      },
      initialScan: {
        done: false,
        rawFiles: []
      },
      notes: {
        'alice.txt': {
          id: 0,
          name: 'alice',
          ext: 'txt',
          path: '/notes/alice.txt'
        },
        'bob.md': {
          id: 1,
          name: 'bob',
          ext: 'md',
          path: '/notes/bob.md'
        },
        'cesar.txt': {
          id: 2,
          name: 'cesar',
          ext: 'txt',
          path: '/notes/cesar.txt'
        }
      },
      scrollTop: 0,
      selectedNote: null,
      sifterResult: {
        items: [
          {id: 'alice.txt', score: 1.0},
          {id: 'bob.md', score: 0.9},
          {id: 'cesar.txt', score: 0.8}
        ],
        options: {
          fields: ['name', 'ext'],
          sort: [{
            field: 'name',
            direction: 'asc'
          }]
        },
        query: '',
        tokens: [],
        total: 3
      }
    }

    store = mockStore(state)
    event = {
      keyCode: 0,
      preventDefault: jasmine.createSpy('preventDefault')
    }
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(keyPressEpic)
  })

  describe('when ENTER key pressed', function () {
    beforeEach(function () {
      atom.config.set('textual-velocity.defaultExt', '.md')
      event.keyCode = ENTER
    })

    describe('when there is no selected note', function () {
      beforeEach(function () {
        store.dispatch(actions.keyPress(event))
        atom.config.set('textual-velocity.defaultExt', 'abc')
        store.dispatch(actions.keyPress(event))
        waitsFor(() => atom.workspace.getPaneItems().length >= 2)
      })

      it('should open a new untitled file', function () {
        expect(atom.workspace.getPaneItems()[0].getPath()).toEqual('/notes/untitled.md')
      })

      it('should allow override defaut extension', function () {
        expect(atom.workspace.getPaneItems()[1].getPath()).toEqual('/notes/untitled.abc')
      })
    })

    describe('when there is a selected note', function () {
      beforeEach(function () {
        state.selectedNote = {
          index: 0,
          filename: 'alice.txt'
        }
        store = mockStore(state)
        store.dispatch(actions.keyPress(event))
        waitsFor(() => atom.workspace.getPaneItems().length >= 2)
      })

      it('should open path of selected note', function () {
        expect(atom.workspace.getPaneItems()[0].getPath()).toEqual('/notes/alice.txt')
      })
    })
  })

  describe('when ESC key pressed', function () {
    beforeEach(function () {
      event.keyCode = ESC
      store.dispatch(actions.keyPress(event))
    })

    it('should yield a reset search action', function () {
      const dispatchedActions = store.getActions()
      expect(dispatchedActions[1]).toEqual(actions.resetSearch())
    })
  })

  describe('when random key pressed', function () {
    beforeEach(function () {
      event.keyCode = 101
      store.dispatch(actions.keyPress(event))
    })

    it('should not yield any reset action', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== actions.KEY_PRESS)
      expect(dispatchedActions).toEqual([])
    })
  })

  describe('when dispose action', function () {
    beforeEach(function () {
      store.dispatch(actions.dispose())
      event.keyCode = ESC
      store.dispatch(actions.keyPress(event))
    })

    it('should no longer create any actions', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== actions.KEY_PRESS)
      expect(dispatchedActions).toEqual([actions.dispose()])
    })
  })
})
