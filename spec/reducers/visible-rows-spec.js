/* @flow */

import {startInitialScan, initialScanDone, search, scrolled} from '../../lib/action-creators'
import Columns from '../../lib/columns'
import FileIconColumn from '../../lib/columns/file-icon-column'
import SummaryColumn from '../../lib/columns/summary-column'
import VisibleRowsReducer from '../../lib/reducers/visible-rows'

describe('visible-rows reducer', () => {
  let state: Array<Row>
  let nextState: State
  let visibleRowsReducer

  beforeEach(function () {
    const columns = new Columns()
    columns.add(new SummaryColumn({sortField: 'name', editCellName: ''}))
    columns.add(new FileIconColumn({sortField: 'ext'}))

    nextState = {
      columnHeaders: [],
      config: {
        dir: '/notes',
        listHeight: 75,
        rowHeight: 25,
        sortDirection: 'asc',
        sortField: 'name'
      },
      forcedScrollTop: null,
      initialScan: {
        done: false,
        rawFiles: []
      },
      notes: {
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
        'cesar.txt': {
          id: 2,
          name: 'cesar',
          path: '/notes/cesar.txt'
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
      },
      pagination: {
        start: 1,
        limit: 3
      },
      sifterResult: {
        items: [
          {id: 'alice.txt', score: 1.0},
          {id: 'bob.txt', score: 0.9},
          {id: 'cesar.txt', score: 0.9},
          {id: 'david.txt', score: 0.8},
          {id: 'eric.txt', score: 0.7}
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
        total: 5
      },
      visibleRows: []
    }
    state = []

    visibleRowsReducer = VisibleRowsReducer(columns)
  })

  const actions = [
    {
      desc: 'initial scan is done',
      createAction: () => initialScanDone()
    }, {
      desc: 'search',
      createAction: () => search('test')
    }, {
      desc: 'scrolled',
      createAction: () => scrolled(123)
    }
  ]
  actions.forEach(action => {
    describe(`when ${action.desc}`, function () {
      beforeEach(function () {
        state = visibleRowsReducer(state, action.createAction(), nextState)
      })

      it('should return paginated rows', function () {
        expect(state).toEqual(jasmine.any(Array))
        expect(state.map(x => x.id)).toEqual([1, 2, 3])
        expect(state.map(x => x.filename)).toEqual(['bob.txt', 'cesar.txt', 'david.txt'])
        expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
      })
    })
  })

  describe('when random action', function () {
    let prevState

    beforeEach(function () {
      prevState = state
      state = visibleRowsReducer(state, startInitialScan(), nextState)
    })

    it('should keep prev state', function () {
      expect(state).toBe(prevState)
    })
  })
})
