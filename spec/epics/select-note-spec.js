/* @flow */

import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import selectNoteEpic, {DOWN, UP} from '../../lib/epics/select-note'
import * as actions from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(selectNoteEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('epics/select-note', () => {
  let state: State
  let store
  let keyPressEvent: KeyPressEvent

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
    keyPressEvent = {
      keyCode: 0,
      preventDefault: jasmine.createSpy('preventDefault')
    }
  })

  afterEach(function () {
    epicMiddleware.replaceEpic(selectNoteEpic)
  })

  describe('when active editor changes', function () {
    describe('when there is a matching note', function () {
      beforeEach(function () {
        let done = false
        atom.workspace.open('/notes/bob.md').then(() => {
          advanceClock(1010)
          done = true
        })
        waitsFor(() => done)
      })

      it('should dispatch action to select matching note', function () {
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 1,
          filename: 'bob.md'
        }))
      })
    })

    describe('when there is no matching note', function () {
      beforeEach(function () {
        store.clearActions()
        let done = false
        atom.workspace.open('/other/file.ext').then(() => {
          advanceClock(1010)
          done = true
        })
        waitsFor(() => done)
      })

      it('should deselect note', function () {
        expect(store.getActions()[0]).toEqual(actions.deselectNote())
      })
    })
  })

  describe('when search action', function () {
    beforeEach(function () {
      store.dispatch(actions.search('abc'))
    })

    it('should yield a deselect-note action', function () {
      expect(store.getActions().slice(-1)[0]).toEqual(actions.deselectNote())
    })

    describe('when dispose action', function () {
      beforeEach(function () {
        store.dispatch(actions.dispose())
        store.dispatch(actions.search('should not be handled'))
      })

      it('should yield more actions from the epic', function () {
        expect(store.getActions().slice(-1)[0]).not.toEqual(actions.deselectNote())
      })
    })
  })

  describe('when reset-search action', function () {
    beforeEach(function () {
      store.dispatch(actions.resetSearch())
    })

    it('should yield a deselect-note action', function () {
      expect(store.getActions().slice(-1)[0]).toEqual(actions.deselectNote())
    })
  })

  describe('when change-sort-field action', function () {
    beforeEach(function () {
      state.sifterResult.items.sort((a: any, b: any) => {
        a = a.id.split('.').slice(-1)[0]
        b = b.id.split('.').slice(-1)[0]
        if (a < b) {
          return -1
        } else if (a > b) {
          return 1
        } else {
          return 0
        }
      })
    })

    describe('when there is a selected note', function () {
      beforeEach(function () {
        state.selectedNote = {index: 0, filename: 'alice.txt'}
        store.dispatch(actions.changeSortField('ext'))
      })

      it('should update selected index', function () {
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 1,
          filename: 'alice.txt'
        }))
      })
    })

    describe('when there is no selected note', function () {
      let action

      beforeEach(function () {
        action = actions.changeSortField('ext')
        store.dispatch(action)
      })

      it('should not yield any action', function () {
        expect(store.getActions().slice(-1)[0]).toEqual(action)
      })
    })
  })

  describe('when change-sort-direction action', function () {
    beforeEach(function () {
      state.sifterResult.items.reverse()
    })

    describe('when there is a selected note', function () {
      beforeEach(function () {
        state.selectedNote = {index: 0, filename: 'alice.txt'}
        store.dispatch(actions.changeSortDirection('desc'))
      })

      it('should update selected index', function () {
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 2,
          filename: 'alice.txt'
        }))
      })
    })

    describe('when there is no selected note', function () {
      let action

      beforeEach(function () {
        action = actions.changeSortDirection('desc')
        store.dispatch(action)
      })

      it('should not yield any action', function () {
        expect(store.getActions().slice(-1)[0]).toEqual(action)
      })
    })
  })

  describe('when DOWN key down action', function () {
    beforeEach(function () {
      keyPressEvent.keyCode = DOWN
    })

    describe('when there is no selected note', function () {
      beforeEach(function () {
        store.dispatch(actions.keyPress(keyPressEvent))
      })

      it('should prevent default behavior of event to not move cursor in text field', function () {
        expect(keyPressEvent.preventDefault).toHaveBeenCalled()
      })

      it('should select first item', function () {
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 0,
          filename: 'alice.txt'
        }))
      })

      it('should select next item until reaching end of list when called subsequently', function () {
        state.selectedNote = store.getActions().slice(-1)[0].selectedNote
        store = mockStore(state)
        store.dispatch(actions.keyPress(keyPressEvent))
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 1,
          filename: 'bob.md'
        }))

        state.selectedNote = store.getActions().slice(-1)[0].selectedNote
        store = mockStore(state)
        store.dispatch(actions.keyPress(keyPressEvent))
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 2,
          filename: 'cesar.txt'
        }))

        state.selectedNote = store.getActions().slice(-1)[0].selectedNote
        store = mockStore(state)
        store.dispatch(actions.keyPress(keyPressEvent))
        state.selectedNote = store.getActions().slice(-1)[0].selectedNote
        store = mockStore(state)
        store.dispatch(actions.keyPress(keyPressEvent))
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 2,
          filename: 'cesar.txt'
        }))
      })
    })
  })

  describe('when UP key down action', function () {
    beforeEach(function () {
      keyPressEvent.keyCode = UP
    })

    describe('when there is no selected note', function () {
      beforeEach(function () {
        store.dispatch(actions.keyPress(keyPressEvent))
      })

      it('should prevent default behavior of event to not move cursor in text field', function () {
        expect(keyPressEvent.preventDefault).toHaveBeenCalled()
      })

      it('should select last item', function () {
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 2,
          filename: 'cesar.txt'
        }))
      })

      it('should select prev item until reaching start of list when called subsequently', function () {
        state.selectedNote = store.getActions().slice(-1)[0].selectedNote
        store = mockStore(state)
        store.dispatch(actions.keyPress(keyPressEvent))
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 1,
          filename: 'bob.md'
        }))

        state.selectedNote = store.getActions().slice(-1)[0].selectedNote
        store = mockStore(state)
        store.dispatch(actions.keyPress(keyPressEvent))
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 0,
          filename: 'alice.txt'
        }))

        state.selectedNote = store.getActions().slice(-1)[0].selectedNote
        store = mockStore(state)
        store.dispatch(actions.keyPress(keyPressEvent))
        state.selectedNote = store.getActions().slice(-1)[0].selectedNote
        store = mockStore(state)
        store.dispatch(actions.keyPress(keyPressEvent))
        expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
          index: 0,
          filename: 'alice.txt'
        }))
      })
    })
  })

  describe('when click row action', function () {
    beforeEach(function () {
      store.dispatch(actions.clickRow('bob.md'))
    })

    it('should select note', function () {
      expect(store.getActions().slice(-1)[0]).toEqual(actions.selectNote({
        index: 1,
        filename: 'bob.md'
      }))
    })
  })

  describe('when random key down action', function () {
    let action

    beforeEach(function () {
      keyPressEvent.keyCode = 101
      action = actions.keyPress(keyPressEvent)
      store.dispatch(action)
    })

    it('should not yield any reset action', function () {
      expect(store.getActions().slice(-1)[0]).toEqual(action)
    })
  })
})
