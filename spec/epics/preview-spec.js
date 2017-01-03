/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import previewEpic from '../../lib/epics/preview'
import * as actions from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(previewEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('epics/preview', () => {
  let state: State
  let store

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
          ext: 'txt'
        },
        'bob.md': {
          id: 1,
          name: 'bob',
          ext: 'md'
        },
        'cesar.txt': {
          id: 2,
          name: 'cesar',
          ext: 'txt'
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
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(previewEpic)
  })

  describe('when select note', function () {
    describe('when there is no editor for path', function () {
      beforeEach(function () {
        store.dispatch(actions.selectNote({index: 0, filename: 'alice.txt'}))

        waitsFor(() => atom.workspace.getPaneItems().length > 0)
      })

      it('should open preview', function () {
        expect(atom.workspace.getPaneItems()[0].tagName.toLowerCase()).toContain('preview')
      })

      it('when deselect note should close preview', function () {
        store.dispatch(actions.deselectNote())
        waitsFor(() => atom.workspace.getPaneItems().length === 0)
      })

      describe('when click preview', function () {
        beforeEach(function () {
          atom.workspace.getPaneItems()[0].click()
          waitsFor(() => !atom.workspace.getPaneItems()[0].tagName)
        })

        it('should open editor for given preview', function () {
          expect(atom.workspace.getPaneItems()[0].getPath()).toEqual(jasmine.any(String))
        })
      })

      describe('when dispose action', function () {
        beforeEach(function () {
          store.dispatch(actions.dispose())
        })

        it('should dispose elements and no longer open any previews', function () {
          store.dispatch(actions.selectNote({index: 0, filename: 'alice.txt'}))
          var done = false
          jasmine.useRealClock()
          setTimeout(function () {
            done = true
          }, 50)
          waitsFor(() => done)
          runs(() => {
            expect(atom.workspace.getPaneItems().length).toEqual(0)
          })
        })
      })
    })

    describe('when a text editor for matching path is already open', function () {
      beforeEach(function () {
        atom.workspace.open('/notes/bob.md')
        store.dispatch(actions.selectNote({index: 0, filename: 'alice.txt'}))

        waitsFor(() => atom.workspace.getPaneItems().length === 2)
        runs(() => {
          store.dispatch(actions.selectNote({index: 1, filename: 'bob.md'}))
        })
        waitsFor(() => atom.workspace.getPaneItems().length === 1) // should close the preview
      })

      it('should reuse text editor as preview', function () {
        expect(atom.workspace.getPaneItems()[0].tagName).toBe(undefined) // not a preview
      })
    })
  })
})
