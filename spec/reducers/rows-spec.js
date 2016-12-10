/* @flow */

import Columns from '../../lib/columns'
import FileIconColumn from '../../lib/columns/file-icon-column'
import SummaryColumn from '../../lib/columns/summary-column'
import NotesFields from '../../lib/notes-fields'
import RowsReducer from '../../lib/reducers/rows'

describe('rows reducer', () => {
  let state: Array<RowStateType>
  let newState: StateType
  let rowsReducer
  let action: ActionType

  describe('when initial-scan-done action', function () {
    beforeEach(function () {
      const columns = new Columns()
      columns.add(new SummaryColumn({sortField: 'name', editCellName: ''}))
      columns.add(new FileIconColumn({sortField: 'ext'}))

      const notesFields = new NotesFields()
      notesFields.add({notePropName: 'name'})
      notesFields.add({notePropName: 'ext'})

      newState = {
        columns: [],
        config: {
          dir: '/notes',
          listHeight: 123,
          rowHeight: 25,
          sortDirection: 'desc',
          sortField: 'ext'
        },
        initialScan: {
          done: false,
          rawFiles: []
        },
        notes: {},
        pagination: {
          start: 0,
          limit: 3
        },
        query: '',
        rows: []
      }
      state = []

      rowsReducer = RowsReducer(columns, notesFields)
    })

    it('should return state if initial scan is not done yet', function () {
      const prevState = state
      action = {type: 'START_INITIAL_SCAN'}
      state = rowsReducer(state, action, newState)
      expect(prevState).toBe(state)
    })

    describe('when initial scan is done', function () {
      beforeEach(function () {
        newState.initialScan.done = true
        newState.notes = {
          'alice.txt': {
            id: 0,
            name: 'alice',
            path: '/notes/alice.txt'
          },
          'bob.txt': {
            id: 1,
            name: 'bob',
            path: '/notes/bob.txt'
          },
          'charly.txt': {
            id: 2,
            name: 'charly',
            path: '/notes/baz.charly'
          },
          'david.txt': {
            id: 3,
            name: 'david',
            path: '/notes/david.txt'
          },
          'eric.txt': {
            id: 4,
            name: 'eric',
            path: '/notes/eric.txt'
          }
        }
        action = {type: 'INITIAL_SCAN_DONE'}
        state = rowsReducer(state, action, newState)
      })

      it('should return initial rows', function () {
        expect(state).toEqual(jasmine.any(Array))
        expect(state.length).toEqual(3)
      })

      it('should contain ids', function () {
        expect(state.map(x => x.id)).toEqual([0, 1, 2])
      })

      it('should contain filenames', function () {
        expect(state.map(x => x.filename)).toEqual(['alice.txt', 'bob.txt', 'charly.txt'])
      })

      it('should contain cells generated from columns', function () {
        expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
      })
    })
  })
})
