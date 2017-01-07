/* @flow */

import NotesFields from '../lib/notes-fields'

describe('notes-fields', () => {
  let notesFields

  beforeEach(function () {
    notesFields = new NotesFields()
  })

  describe('.forEach', function () {
    let testNoteField

    beforeEach(function () {
      testNoteField = {
        notePropName: 'test',
        value: (note, filename) => filename.split('.').slice(-1)[0]
      }
      notesFields.add(testNoteField)
      notesFields.add({notePropName: 'content'}) // fields that only is there to indicate the existance of the field doesn't need a value transformer
    })

    it('should iterate each note field', function () {
      const tmp = []
      notesFields.forEach(noteField => {
        tmp.push(noteField)
      })
      expect(tmp[0]).toEqual(testNoteField)
    })
  })

  describe('.map', function () {
    beforeEach(function () {
      notesFields.add({
        notePropName: 'test',
        value: (note, filename) => filename.split('.').slice(-1)[0]
      })
      notesFields.add({notePropName: 'content'}) // fields that only is there to indicate the existance of the field doesn't need a value transformer
    })

    it('should return map values', function () {
      expect(notesFields.map(noteField => noteField.notePropName)).toEqual(['test', 'content'])
    })
  })

  describe('.propNames', function () {
    beforeEach(function () {
      notesFields.add({notePropName: 'test'})
      notesFields.add({notePropName: 'content'})
    })
    it('should return a list of notes prop names', function () {
      expect(notesFields.propNames()).toEqual(['test', 'content'])
    })
  })
})
