/* @flow */

import * as A from '../../lib/action-creators'
import NotesFields from '../../lib/notes-fields'
import makeNotesReducer from '../../lib/reducers/notes'

describe('reducers/notes', () => {
  let state: Notes
  let nextInitialScan: InitialScan
  let notesReducer

  beforeEach(function () {
    state = undefined
    const notesFields = new NotesFields()
    notesFields.add({
      notePropName: 'ext',
      value: (note, filename) => filename.split('.').slice(-1)[0]
    })

    // Some fields are set by a file-reader, in those cases the field is only there to indicate that the field exist
    notesFields.add({notePropName: 'content'})

    notesReducer = makeNotesReducer(notesFields)
  })

  describe('when initial-scan-done action', function () {
    beforeEach(function () {
      nextInitialScan = {
        done: true,
        rawFiles: [{
          filename: 'a.txt',
          stats: {mtime: new Date()}
        }, {
          filename: 'b.md',
          stats: {mtime: new Date()}
        }]
      }
      state = notesReducer(state, A.initialScanDone(), nextInitialScan)
    })

    it('should reduce notes from raw notes', function () {
      expect(Object.keys(state).length).toEqual(2)
    })

    it('should apply notesFields on notes', function () {
      expect(state['a.txt']).toEqual(jasmine.any(Object))
      expect(state['a.txt'].ext).toEqual('txt')
      expect(state['b.md'].ext).toEqual('md')
    })

    it('should set an unique id on the note', function () {
      expect(state['a.txt'].id).toEqual(jasmine.any(String))
    })

    it('should set stats object on note', function () {
      expect(state['a.txt'].stats).toEqual(jasmine.any(Object))
    })
  })

  describe('when file is added', function () {
    let action

    beforeEach(function () {
      nextInitialScan = {
        done: false,
        rawFiles: [{
          filename: 'a.txt',
          stats: {mtime: new Date()}
        }, {
          filename: 'b.md',
          stats: {mtime: new Date()}
        }]
      }
      action = A.fileAdded({
        filename: 'alice.txt',
        stats: {mtime: new Date()}
      })
    })

    describe('when initial scan is not yet done', function () {
      beforeEach(function () {
        state = notesReducer(state, action, nextInitialScan)
      })

      it('should not do anything', function () {
        expect(state).toEqual({})
      })
    })

    describe('when initial scan is done', function () {
      beforeEach(function () {
        nextInitialScan.done = true
        state = notesReducer(state, action, nextInitialScan)
      })

      it('should add new note', function () {
        expect(state).toEqual({
          'alice.txt': {
            id: jasmine.any(String),
            stats: {mtime: jasmine.any(Date)},
            ext: 'txt'
          }
        })
      })

      describe('when file is removed', function () {
        beforeEach(function () {
          action = A.fileDeleted('alice.txt')
          state = notesReducer(state, action, nextInitialScan)
        })

        it('should remove note', function () {
          expect(state).toEqual({})
        })
      })
    })
  })
})
