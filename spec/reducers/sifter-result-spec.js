/* @flow */

import {initialScanDone, search, scrolled} from '../../lib/action-creators'
import NotesFields from '../../lib/notes-fields'
import SifterResultReducer from '../../lib/reducers/sifter-result'

describe('sifter-result reducer', () => {
  let state: SifterResult
  let nextState: State
  let sifterResultReducer

  describe('when initial-scan-done action', function () {
    beforeEach(function () {
      const notesFields = new NotesFields()
      notesFields.add({notePropName: 'name'})
      notesFields.add({notePropName: 'ext'})

      state = {
        items: [],
        options: {
          fields: [],
          limit: 0,
          sort: []
        },
        query: '',
        tokens: [],
        total: 0
      }
      nextState = {
        columns: [],
        config: {
          dir: '/notes',
          listHeight: 123,
          rowHeight: 25,
          sortDirection: 'asc',
          sortField: 'ext'
        },
        forcedScrollTop: null,
        initialScan: {
          done: false,
          rawFiles: []
        },
        notes: {
          'alice.md': {
            name: 'alice',
            ext: 'md'
          },
          'bob.md': {
            name: 'bob',
            ext: 'md'
          },
          'cesar.txt': {
            name: 'cesar',
            ext: 'txt'
          },
          'david.txt': {
            name: 'david',
            ext: 'txt'
          },
          'eric.md': {
            name: 'eric',
            ext: 'md'
          }
        },
        pagination: {
          start: 0,
          limit: 3
        },
        sifterResult: {
          items: [],
          options: {
            fields: [],
            limit: 0,
            sort: []
          },
          query: '',
          tokens: [],
          total: 0
        },
        visibleRows: []
      }

      sifterResultReducer = SifterResultReducer(notesFields)
    })

    describe('when initial scan is done', function () {
      beforeEach(function () {
        state = sifterResultReducer(state, initialScanDone(), nextState)
      })

      it('should return results for empty query', function () {
        expect(state.query).toEqual('')
      })
    })

    describe('when search', function () {
      beforeEach(function () {
        state = sifterResultReducer(state, search('md'), nextState)
      })

      it('should update query', function () {
        expect(state.query).toEqual('md')
      })

      it('should return results matching query', function () {
        expect(state.total).toEqual(3)
        expect(state.items.length).toEqual(3)
        expect(state.items[0].id).toEqual('alice.md')
      })

      it('should return regexp for matched token', function () {
        expect(state.tokens).toEqual(jasmine.any(Array))
        expect(state.tokens[0]).toEqual({
          string: 'md',
          regex: jasmine.any(RegExp)
        })
      })

      it('should sort based on vars from config', function () {
        expect(state.options.sort[0]).toEqual({field: 'ext', direction: 'asc'})
      })

      it('should sort fallback on score in desc order', function () {
        expect(state.options.sort[1]).toEqual({field: '$score', direction: 'desc'})
      })
    })

    describe('when any other action', function () {
      let prevState

      beforeEach(function () {
        prevState = state
        state = sifterResultReducer(state, scrolled(0), nextState)
      })

      it('should return prev state', function () {
        expect(state).toBe(prevState)
      })
    })
  })
})
