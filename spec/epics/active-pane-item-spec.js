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
      initialScan: {
        done: false,
        rawFiles: []
      },
      listHeight: 75,
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
    epicMiddleware.replaceEpic(activePaneItemEpic)
  })

  describe('when active pane item changes', function () {
    describe('when it is a text editor', function () {
      beforeEach(function () {
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
  })
})
