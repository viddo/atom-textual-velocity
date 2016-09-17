'use babel'

import Path from 'path'
import NotesFile from '../lib/notes-file'

describe('notes-file', () => {
  let file

  beforeEach(function () {
    const getFullPath = relPath => Path.join(__dirname, relPath)
    const relPath = __filename.replace(__dirname, '').replace(Path.sep, '')
    file = new NotesFile(relPath, getFullPath)
  })

  it('should return a file object', function () {
    expect(file.id).toEqual(jasmine.any(String), 'should have a unique identifier')
    expect(file.relPath).toEqual('notes-file-spec.js', 'should have a relative path')
    expect(file.path).toEqual(__filename, 'should have a full path')
    expect(file.base).toEqual('notes-file-spec.js', 'should have a basename')
    expect(file.name).toEqual('notes-file-spec', 'should have a filename w/o extension')
    expect(file.ext).toEqual('.js', 'should have a file ext')
  })
})
