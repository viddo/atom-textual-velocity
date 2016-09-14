/* @flow */

import fs from 'fs'
import Path from 'path'
import fileWriter from '../../lib/file-writers/rename-file-writer'

describe('rename-file-writer', function () {
  describe('.write', function () {
    let callbackSpy
    let oldPath

    beforeEach(function () {
      oldPath = '/path/to/notes/old-file-path.txt'
      spyOn(fs, 'rename')
      callbackSpy = jasmine.createSpy('callback')
    })

    it('should do nothing if given empty base', function () {
      fileWriter.write(oldPath, '', callbackSpy)
      expect(fs.rename).not.toHaveBeenCalled()
    })

    it('should not allow path separator in the string', function () {
      const base = Path.join('only', 'use', 'this-last-piece.txt')
      fileWriter.write(oldPath, base, callbackSpy)
      expect(fs.rename).toHaveBeenCalledWith(oldPath, '/path/to/notes/this-last-piece.txt', callbackSpy)
    })

    it('should trim and normalize base', function () {
      fileWriter.write(oldPath, '  test.txt  ', callbackSpy)
      expect(fs.rename).toHaveBeenCalledWith(oldPath, '/path/to/notes/test.txt', callbackSpy)
    })
  })
})
