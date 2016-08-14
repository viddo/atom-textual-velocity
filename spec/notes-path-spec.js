'use babel'

import fs from 'fs'
import NotesPath from '../lib/notes-path'

describe('notes-path', () => {
  beforeEach(function () {
    this.notesPath = NotesPath(__dirname)
  })

  it('should have a root prop', function () {
    expect(this.notesPath.root).toEqual(__dirname)
  })

  describe('.fullPath', function () {
    it('should return the full path of a file', function () {
      expect(this.notesPath.fullPath('file.txt')).toMatch(/.+file.txt$/)
      expect(this.notesPath.fullPath('file.txt')).toMatch(__dirname)
    })
  })

  describe('.newFile', function () {
    const assertFileProps = customAssertions => {
      it('should return a file object', function () {
        expect(this.file.id).toEqual(jasmine.any(String), 'should have a unique identifier')
        expect(this.file.relPath).toMatch('path-spec.js', 'should have a relative path')
        expect(this.file.path).toMatch(__filename, 'should have a full path')
        expect(this.file.name).toMatch('path-spec', 'should have a filename w/o extension')
        expect(this.file.ext).toMatch('.js', 'should have a file ext')
      })

      customAssertions()
    }

    describe('when only given filename', function () {
      beforeEach(function () {
        const relPath = __filename.replace(__dirname, '')
        this.file = this.notesPath.newFile(relPath)
      })

      assertFileProps(function () {
        it('should not have content just yet', function () {
          expect(this.file.content).toEqual(null)
        })

        it('should not have stat times just yet', function () {
          expect(this.file.createdTime).toBeUndefined()
          expect(this.file.lastUpdatedTime).toBeUndefined()
        })
      })
    })

    describe('when given filename and content', function () {
      beforeEach(function () {
        const relPath = __filename.replace(__dirname, '')
        this.file = this.notesPath.newFile(relPath, {content: 'foobar'})
      })

      assertFileProps(function () {
        it('should return a new file with content', function () {
          expect(this.file.content).toEqual('foobar', 'should have content')
        })
      })
    })

    describe('when given filename and stat', function () {
      beforeEach(function () {
        const relPath = __filename.replace(__dirname, '')
        this.file = this.notesPath.newFile(relPath, {stat: fs.statSync(__filename)})
      })

      assertFileProps(function () {
        it('should return a new file with times', function () {
          expect(this.file.createdTime).toEqual(jasmine.any(Number), 'should have a creation time')
          expect(this.file.lastUpdatedTime).toEqual(jasmine.any(Number), 'should have a last-updated time')
        })
      })
    })
  })
})
