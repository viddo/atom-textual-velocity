/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import openNoteEpic from '../../lib/epics/open-note'
import * as A from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(openNoteEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('epics/open-note', () => {
  let state: State
  let store

  beforeEach(() => {
    state = {
      columnHeaders: [],
      dir: '/notes',
      editCellName: null,
      initialScan: {
        done: false,
        rawFiles: []
      },
      listHeight: 75,
      notes: {
        'alice.txt': {
          id: '0',
          name: 'alice',
          ext: 'txt',
          path: '/notes/alice.txt',
          stats: {mtime: new Date()}
        },
        'bob.md': {
          id: '1',
          name: 'bob',
          ext: 'md',
          path: '/notes/bob.md',
          stats: {mtime: new Date()}
        },
        'cesar.txt': {
          id: '2',
          name: 'cesar',
          ext: 'txt',
          path: '/notes/cesar.txt',
          stats: {mtime: new Date()}
        }
      },
      rowHeight: 25,
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
          sort: [
            {field: 'name', direction: 'asc'},
            {field: '$score', direction: 'desc'}
          ]
        },
        query: '',
        tokens: [],
        total: 3
      }
    }

    store = mockStore(state)
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(openNoteEpic)
  })

  describe('when open-note action', function () {
    beforeEach(function () {
      atom.config.set('textual-velocity.defaultExt', '.md')
    })

    describe('when there is no selected note', function () {
      beforeEach(function () {
        store.dispatch(A.openNote())

        atom.config.set('textual-velocity.defaultExt', 'abc')
        store.dispatch(A.openNote())

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
        store.dispatch(A.openNote())
        waitsFor(() => atom.workspace.getPaneItems().length >= 2)
      })

      it('should open path of selected note', function () {
        expect(atom.workspace.getPaneItems()[0].getPath()).toEqual('/notes/alice.txt')
      })
    })
  })

  describe('when dispose action', function () {
    beforeEach(function () {
      store.dispatch(A.dispose())
      store.dispatch(A.startInitialScan())
    })

    it('should no longer create any actions', function () {
      const dispatchedActions = store.getActions().filter(action => action.type !== A.START_INITIAL_SCAN)
      expect(dispatchedActions).toEqual([A.dispose()])
    })
  })
})
