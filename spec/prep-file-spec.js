'use babel'

import prepFile from '../lib/prep-file'

describe('prep-file', () => {
  let File

  beforeEach(function () {
    File = prepFile(__dirname, {
      ignoredNames: atom.config.get('core.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('core.excludeVcsIgnoredPaths')
    })
  })

  it('should return a File object', function () {
    expect(File).toBeDefined()
  })

  describe('File.accepts', function () {
    it('should return whether given relPath is accepted as file', function () {
      expect(File.accepts('file.txt')).toBe(true)
      expect(File.accepts('file.md')).toBe(true)
      expect(File.accepts(__filename)).toBe(true)

      expect(File.accepts('file.exe')).toBe(false)
      expect(File.accepts('.git/index')).toBe(false)
      expect(File.accepts('.DS_Store')).toBe(false)
    })
  })

  describe('File.fullPath', function () {
    it('should return the full path', function () {
      expect(File.fullPath('file.txt')).toMatch(/.+file.txt$/)
    })
  })

  describe('File', function () {
    beforeEach(function () {
      const relPath = __filename.replace(__dirname, '')
      this.file = new File(relPath)
    })

    describe('.id', function () {
      it('should return a unqiue identifier', function () {
        expect(this.file.id).toEqual(jasmine.any(String))
      })
    })

    describe('.relpath', function () {
      it('should return the full path', function () {
        expect(this.file.relPath).toMatch('prep-file-spec.js')
      })
    })

    describe('.content', function () {
      it('should return an empty string by default', function () {
        expect(this.file.content).toBeNull()
      })
    })

    describe('.path', function () {
      it('should return the full path', function () {
        expect(this.file.path).toMatch(__filename)
      })
    })

    describe('.name', function () {
      it('should return the filename', function () {
        expect(this.file.name).toMatch('prep-file-spec')
      })
    })

    describe('.ext', function () {
      it('should return the file extension', function () {
        expect(this.file.path).toMatch('.js')
      })
    })

    describe('.createdTime', function () {
      it('should return the time when file was creatd', function () {
        expect(this.file.createdTime).toEqual(jasmine.any(Number))
      })
    })

    describe('.lastUpdatedTime', function () {
      it('should return the time when file was last updated', function () {
        expect(this.file.lastUpdatedTime).toEqual(jasmine.any(Number))
      })
    })

    describe('.withContent', function () {
      beforeEach(function () {
        this.newFile = this.file.withContent('foobar')
      })

      it('should return a new file', function () {
      })

      describe('should create a new file', function () {
        beforeEach(function () {
          expect(this.newFile).toBeDefined()
          expect(this.newFile).not.toBe(this.file)
        })

        it('with content', function () {
          expect(this.newFile.content).toEqual('foobar')
        })

        it('with same path', function () {
          expect(this.newFile.relPath).toEqual(this.file.relPath)
        })

        it('with same stat', function () {
          expect(this.newFile.createdTime).toEqual(this.file.createdTime)
        })
      })
    })
  })
})
