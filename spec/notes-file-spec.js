'use babel'

import fs from 'fs'
import Path from 'path'
import NotesFile from '../lib/notes-file'

describe('notes-file', () => {
  beforeEach(function () {
    this.getFullPath = relPath => Path.join(__dirname, relPath)
  })

  const assertFileProps = customAssertions => {
    it('should return a file object', function () {
      expect(this.file.id).toEqual(jasmine.any(String), 'should have a unique identifier')
      expect(this.file.relPath).toMatch('notes-file-spec.js', 'should have a relative path')
      expect(this.file.path).toMatch(__filename, 'should have a full path')
      expect(this.file.name).toMatch('notes-file-spec', 'should have a filename w/o extension')
      expect(this.file.ext).toMatch('.js', 'should have a file ext')
    })

    customAssertions()
  }

  describe('when only given filename', function () {
    beforeEach(function () {
      const relPath = __filename.replace(__dirname, '')
      this.file = new NotesFile(this.getFullPath, relPath)
    })

    assertFileProps(function () {
      it('should not have content just yet', function () {
        expect(this.file.content).toBeFalsy()
      })

      it('should not have stats times just yet', function () {
        expect(this.file.createdTime).toBeUndefined()
        expect(this.file.lastUpdatedTime).toBeUndefined()
      })
    })
  })

  describe('when given filename and content', function () {
    beforeEach(function () {
      const relPath = __filename.replace(__dirname, '')
      this.file = new NotesFile(this.getFullPath, relPath, {content: 'foobar', stats: undefined})
    })

    assertFileProps(function () {
      it('should return a new file with content', function () {
        expect(this.file.content).toEqual('foobar', 'should have content')
      })
    })
  })

  describe('when given filename and stats', function () {
    beforeEach(function () {
      const relPath = __filename.replace(__dirname, '')
      this.file = new NotesFile(this.getFullPath, relPath, {content: '', stats: fs.statSync(__filename)})
    })

    assertFileProps(function () {
      it('should return a new file with times', function () {
        expect(this.file.createdTime).toEqual(jasmine.any(Number), 'should have a creation time')
        expect(this.file.lastUpdatedTime).toEqual(jasmine.any(Number), 'should have a last-updated time')
      })
    })
  })
})
