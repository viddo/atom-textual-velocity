/* @flow */

import NotesFields from '../lib/notes-fields'

describe('notes-fields', () => {
  let notesFields

  beforeEach(function () {
    notesFields = new NotesFields()
  })

  describe('.all', function () {
    beforeEach(function () {
      notesFields.add({
        notePropName: 'test',
        value: (note, filename) => filename.split('.').slice(-1)[0]
      })
      notesFields.add({notePropName: 'content'}) // fields that only is there to indicate the existance of the field doesn't need a value transformer
    })

    it('should return all fields that have been added', function () {
      expect(notesFields.all()).toEqual(jasmine.any(Array))
      expect(notesFields.all().length).toEqual(2)
      expect(notesFields.all()[0].notePropName).toEqual('test')
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
