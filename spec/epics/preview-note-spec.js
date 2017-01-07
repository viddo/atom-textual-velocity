/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import previewNoteEpic from '../../lib/epics/preview-note'
import * as A from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(previewNoteEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('epics/preview-note', () => {
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

    const getState = () => ({...state}) // make sure state is unique for each action
    store = mockStore(getState)
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(previewNoteEpic)
  })

  describe('when select note', function () {
    describe('when there is no editor for path', function () {
      beforeEach(function () {
        state.selectedNote = {
          filename: 'alice.txt',
          index: 0
        }
        store.dispatch(A.selectNext())

        expect(atom.workspace.getPaneItems()).toEqual([], 'there should not be any pane items yet')
        waitsFor(() => atom.workspace.getPaneItems().length > 0) // waits for preview
      })

      it('should open preview', function () {
        expect(atom.workspace.getPaneItems()[0].tagName.toLowerCase()).toContain('preview')
      })

      it('should close preview when deselected note', function () {
        state.selectedNote = null
        store.dispatch(A.resetSearch())
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
          store.dispatch(A.dispose())
        })

        it('should dispose elements and no longer open any previews', function () {
          state.selectedNote = {
            filename: 'alice.txt',
            index: 0
          }
          store.dispatch(A.selectNext())
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
        state.selectedNote = {
          filename: 'alice.txt',
          index: 0
        }
        store.dispatch(A.selectNext())

        waitsFor(() => atom.workspace.getPaneItems().length === 2)
        runs(() => {
          state.selectedNote = {
            filename: 'bob.md',
            index: 1
          }
          store.dispatch(A.selectNext())
        })
        waitsFor(() => atom.workspace.getPaneItems().length === 1) // should close the preview
      })

      it('should reuse text editor as preview', function () {
        expect(atom.workspace.getPaneItems()[0].tagName).toBe(undefined) // not a preview
      })
    })
  })
})
