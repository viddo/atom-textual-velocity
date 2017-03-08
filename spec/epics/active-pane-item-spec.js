/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import activePaneItemEpic from '../../lib/epics/active-pane-item'
import * as A from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(activePaneItemEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('epics/active-pane-item', () => {
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
      queryOriginal: '',
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

    spyOn(Date, 'now').andReturn(0)

    store = mockStore(state)
    store.dispatch(A.resizeList(123)) // dummy action, just to have action$ to have a value to start with
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(activePaneItemEpic)
  })

  describe('when active pane item is changed due to non-package interaction (e.g. open recent file or such)', function () {
    beforeEach(function () {
      store.clearActions()

      Date.now.andReturn(500) // for open-file event to not be interpreted as a package interaction

      let done = false
      atom.workspace.open('/notes/bob.md').then(() => {
        advanceClock(1010)
        done = true
      })
      waitsFor(() => done)
    })

    it('should dispatch action to select matching note', function () {
      expect(store.getActions().slice(-1)[0]).toEqual(A.changedActivePaneItem('/notes/bob.md'))
    })
  })

  describe('when active pane item is changed due to interaction with plugin, e.g. select note (=> preview)', function () {
    beforeEach(function () {
      store.clearActions()

      let done = false
      atom.workspace.open('/notes/untitled.md').then(() => {
        advanceClock(1010)
        done = true
      })
      waitsFor(() => done)
    })

    it('should not dispatch any action', function () {
      expect(store.getActions()).toEqual([])
    })
  })
})
