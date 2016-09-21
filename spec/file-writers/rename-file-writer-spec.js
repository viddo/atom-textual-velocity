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
      spyOn(fs, 'renameSync')
      spyOn(fs, 'utimesSync')
      callbackSpy = jasmine.createSpy('callback')
    })

    it('should do nothing if given empty value', function () {
      fileWriter.write(oldPath, '', callbackSpy)
      expect(fs.renameSync).not.toHaveBeenCalled()
      expect(fs.utimesSync).not.toHaveBeenCalled()
      expect(callbackSpy).not.toHaveBeenCalled()
    })

    it('should not allow path separator', function () {
      const str = Path.join('only', 'use', 'this-last-piece.txt')
      fileWriter.write(oldPath, str, callbackSpy)
      expect(fs.renameSync).toHaveBeenCalledWith(oldPath, '/path/to/notes/this-last-piece.txt')
      expect(fs.utimesSync).toHaveBeenCalled()
      expect(callbackSpy).toHaveBeenCalledWith(null, null)
    })

    it('should trim and normalize value', function () {
      fileWriter.write(oldPath, '  test.txt  ', callbackSpy)
      expect(fs.renameSync).toHaveBeenCalledWith(oldPath, '/path/to/notes/test.txt')
      expect(fs.utimesSync).toHaveBeenCalled()
      expect(callbackSpy).toHaveBeenCalledWith(null, null)
    })
  })
})
