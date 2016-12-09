/* @flow */

import {initialScanDone} from '../../lib/action-creators'
import NotesFields from '../../lib/notes-fields'
import NotesReducer from '../../lib/reducers/notes'

describe('notes reducer', () => {
  let state: NotesStateType
  let rawNotes: Array<RawFileType>

  describe('when initial-scan-done action', function () {
    beforeEach(function () {
      rawNotes = [{
        filename: 'a.txt',
        stats: {mtime: new Date()}
      }, {
        filename: 'b.md',
        stats: {mtime: new Date()}
      }]

      const notesFields = new NotesFields()
      notesFields.add({
        notePropName: 'ext',
        value: (note, filename) => filename.split('.').slice(-1)[0]
      })

      // Some fields are set by a file-reader, in those cases the field is only there to indicate that the field exist
      notesFields.add({notePropName: 'content'})

      const notesReducer = NotesReducer(notesFields)
      state = notesReducer(state, initialScanDone(), rawNotes)
    })

    it('should apply notesFields on notes', function () {
      expect(Object.keys(state).length).toEqual(2)
      expect(state['a.txt']).toEqual(jasmine.any(Object))
      expect(state['a.txt'].ext).toEqual('txt')
      expect(state['b.md'].ext).toEqual('md')
    })
  })
})
