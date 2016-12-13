/* @flow */

import * as actions from '../../lib/action-creators'
import Columns from '../../lib/columns'
import FileIconColumn from '../../lib/columns/file-icon-column'
import SummaryColumn from '../../lib/columns/summary-column'
import VisibleRowsReducer from '../../lib/reducers/visible-rows'

describe('visible-rows reducer', () => {
  let state: Array<Row>
  let nextState: State
  let visibleRowsReducer
  let prevState

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
        'bob.md': {
          id: 1,
          name: 'bob',
          path: '/notes/bob.md'
        },
        'cesar.txt': {
          id: 2,
          name: 'cesar',
          path: '/notes/cesar.txt'
        },
        'david.md': {
          id: 3,
          name: 'david',
          path: '/notes/david.md'
        },
        'eric.txt': {
          id: 4,
          name: 'eric',
          path: '/notes/eric.txt'
        }
      },
      pagination: {
        start: 0,
        limit: 3
      },
      sifterResult: {
        items: [
          {id: 'alice.txt', score: 1.0},
          {id: 'bob.md', score: 0.9},
          {id: 'cesar.txt', score: 0.9},
          {id: 'david.md', score: 0.8},
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

  describe('when initial scan is done', function () {
    beforeEach(function () {
      prevState = state
      state = visibleRowsReducer(state, actions.initialScanDone(), nextState)
    })

    it('should updated state', function () {
      expect(state).not.toBe(prevState)
    })

    it('should return paginated rows', function () {
      expect(state).toEqual(jasmine.any(Array))
      expect(state.map(x => x.id)).toEqual([0, 1, 2])
      expect(state.map(x => x.filename)).toEqual(['alice.txt', 'bob.md', 'cesar.txt'])
      expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
    })
  })

  describe('when search', function () {
    beforeEach(function () {
      prevState = state
      nextState.sifterResult.query = 'a' // alice, cesar, david
      nextState.sifterResult.items = [
        {id: 'alice.txt', score: 0.1},
        {id: 'cesar.txt', score: 0.1},
        {id: 'david.md', score: 0.1}
      ]
      state = visibleRowsReducer(state, actions.search('a'), nextState)
    })

    it('should updated state', function () {
      expect(state).not.toBe(prevState)
    })

    it('should return paginated rows', function () {
      expect(state).toEqual(jasmine.any(Array))
      expect(state.map(x => x.id)).toEqual([0, 2, 3])
      expect(state.map(x => x.filename)).toEqual(['alice.txt', 'cesar.txt', 'david.md'])
      expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
    })
  })

  describe('when scrolled', function () {
    beforeEach(function () {
      prevState = state
      nextState.pagination = {
        start: 1,
        limit: 3
      }
      state = visibleRowsReducer(state, actions.scroll(25), nextState)
    })

    it('should updated state', function () {
      expect(state).not.toBe(prevState)
    })

    it('should return paginated rows', function () {
      expect(state).toEqual(jasmine.any(Array))
      expect(state.map(x => x.id)).toEqual([1, 2, 3])
      expect(state.map(x => x.filename)).toEqual(['bob.md', 'cesar.txt', 'david.md'])
      expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
    })
  })

  describe('when resized list', function () {
    beforeEach(function () {
      prevState = state
      nextState.pagination = {
        start: 1,
        limit: 100
      }
      state = visibleRowsReducer(state, actions.resizeList(1001), nextState)
    })

    it('should updated state', function () {
      expect(state).not.toBe(prevState)
    })

    it('should return paginated rows', function () {
      expect(state).toEqual(jasmine.any(Array))
      expect(state.map(x => x.id)).toEqual([1, 2, 3, 4])
      expect(state.map(x => x.filename)).toEqual(['bob.md', 'cesar.txt', 'david.md', 'eric.txt'])
      expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
    })
  })

  describe('when changed list height', function () {
    beforeEach(function () {
      prevState = state
      nextState.pagination = {
        start: 1,
        limit: 100
      }
      state = visibleRowsReducer(state, actions.changeListHeight(1001), nextState)
    })

    it('should updated state', function () {
      expect(state).not.toBe(prevState)
    })

    it('should return paginated rows', function () {
      expect(state).toEqual(jasmine.any(Array))
      expect(state.map(x => x.id)).toEqual([1, 2, 3, 4])
      expect(state.map(x => x.filename)).toEqual(['bob.md', 'cesar.txt', 'david.md', 'eric.txt'])
      expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
    })
  })

  describe('when changed row height', function () {
    beforeEach(function () {
      prevState = state
      nextState.pagination = {
        start: 1,
        limit: 7
      }
      state = visibleRowsReducer(state, actions.changeRowHeight(15), nextState)
    })

    it('should updated state', function () {
      expect(state).not.toBe(prevState)
    })

    it('should return paginated rows', function () {
      expect(state).toEqual(jasmine.any(Array))
      expect(state.map(x => x.id)).toEqual([1, 2, 3, 4])
      expect(state.map(x => x.filename)).toEqual(['bob.md', 'cesar.txt', 'david.md', 'eric.txt'])
      expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
    })
  })

  describe('when changed sort direction', function () {
    beforeEach(function () {
      prevState = state
      nextState.config.sortDirection = 'desc'
      nextState.sifterResult.items = nextState.sifterResult.items.reverse()
      state = visibleRowsReducer(state, actions.changeSortDirection('desc'), nextState)
    })

    it('should updated state', function () {
      expect(state).not.toBe(prevState)
    })

    it('should return paginated rows', function () {
      expect(state).toEqual(jasmine.any(Array))
      expect(state.map(x => x.id)).toEqual([4, 3, 2])
      expect(state.map(x => x.filename)).toEqual(['eric.txt', 'david.md', 'cesar.txt'])
      expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
    })
  })

  describe('when changed sort field', function () {
    beforeEach(function () {
      prevState = state
      nextState.config.sortField = 'ext'
      nextState.sifterResult.items = nextState.sifterResult.items
        .sort((a: any, b: any) => {
          a = a.id.split('.')[1]
          b = b.id.split('.')[1]
          if (a < b) return -1
          if (a > b) return 1
          return 0 // equal
        })
      state = visibleRowsReducer(state, actions.changeSortField('ext'), nextState)
    })

    it('should updated state', function () {
      expect(state).not.toBe(prevState)
    })

    it('should return paginated rows', function () {
      expect(state).toEqual(jasmine.any(Array))
      expect(state.map(x => x.id)).toEqual([1, 3, 0])
      expect(state.map(x => x.filename)).toEqual(['bob.md', 'david.md', 'alice.txt'])
      expect(state.map(x => x.cells)).toEqual(jasmine.any(Array))
    })
  })

  describe('when other random action', function () {
    let prevState

    beforeEach(function () {
      prevState = state
      state = visibleRowsReducer(state, actions.startInitialScan(), nextState)
    })

    it('should keep prev state', function () {
      expect(state).toBe(prevState)
    })
  })
})
