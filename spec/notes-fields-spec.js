/* @flow */

import NotesFields from '../lib/notes-fields'

describe('notes-fields', () => {
  let notesFields

  beforeEach(function () {
    notesFields = new NotesFields()
  })

  it('should allow to add and get all fields', function () {
    notesFields.add({
      notePropName: 'test',
      value: (note, filename) => filename.split('.').slice(-1)[0]
    })
    notesFields.add({notePropName: 'content'}) // fields that only is there to indicate the existance of the field doesn't need a value transformer

    expect(notesFields.allFields()).toEqual(jasmine.any(Array))
    expect(notesFields.allFields().length).toEqual(2)
    expect(notesFields.allFields()[0].notePropName).toEqual('test')
  })
})
