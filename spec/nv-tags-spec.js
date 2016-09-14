var Path = require('path')
var temp = require('temp').track()

try {
  // Test if optionalDependencies are available, otherwise skip these specs
  var bplist = require('bplist') // eslint-disable-line
  var xattr = require('fs-xattr') // eslint-disable-line
} catch (err) {
  return
}

var Service = require('../lib/service')
var NVTags = require('../lib/nv-tags')

describe('nv-tags', function () {
  var disposable, publicServiceAPI

  beforeEach(function () {
    var service = new Service()
    publicServiceAPI = service.publicAPI() // integration tested through main-spec.js and CI env
    spyOn(publicServiceAPI, 'registerColumns')
    spyOn(publicServiceAPI, 'registerFields')
    spyOn(publicServiceAPI, 'registerFileReaders')
    spyOn(publicServiceAPI, 'registerFileWriters')

    disposable = NVTags.consumeTextualVelocityServiceV0(publicServiceAPI)
    expect(publicServiceAPI.registerColumns).toHaveBeenCalled()
    expect(publicServiceAPI.registerFields).toHaveBeenCalled()
    expect(publicServiceAPI.registerFileReaders).toHaveBeenCalled()
    expect(publicServiceAPI.registerFileWriters).toHaveBeenCalled()
  })

  afterEach(function () {
    disposable.dispose()
  })

  describe('registered file-reader', function () {
    var fileReader, path, callback

    beforeEach(function () {
      fileReader = publicServiceAPI.registerFileReaders.mostRecentCall.args[0]
      callback = jasmine.createSpy('callback')
    })

    describe('.read', function () {
      it('should return tags for a valid file', function () {
        path = Path.join(__dirname, 'fixtures', 'standard', 'notational-velocity-tags.txt')
        fileReader.read(path, callback)
        waitsFor(function () {
          return callback.calls.length >= 1
        })
        runs(function () {
          expect(callback.mostRecentCall.args[0]).toBeFalsy()
          expect(callback.mostRecentCall.args[1]).toEqual(['beep', 'boop'])
        })
      })

      it('should return null for a file that have no xattrs set', function () {
        path = Path.join(__dirname, 'fixtures', 'standard', 'empty.md')
        fileReader.read(path, callback)
        waitsFor(function () {
          return callback.calls.length >= 1
        })
        runs(function () {
          expect(callback.mostRecentCall.args[0]).toBeFalsy()
          expect(callback.mostRecentCall.args[1]).toEqual(null)
        })
      })

      it('should return error if file does not exist', function () {
        fileReader.read('nonexisting', callback)
        waitsFor(function () {
          return callback.calls.length >= 1
        })
        runs(function () {
          expect(callback.mostRecentCall.args[0]).toBeDefined()
          expect(callback.mostRecentCall.args[0].code).toEqual('ENOENT')
          expect(callback.mostRecentCall.args[1]).toBeFalsy()
        })
      })
    })
  })

  describe('registered field', function () {
    var field

    beforeEach(function () {
      field = publicServiceAPI.registerFields.mostRecentCall.args[0]
    })

    describe('.value', function () {
      it('should return the tags as a space separated string', function () {
        expect(field.value({data: {nvtags: ['beep', 'boop']}})).toEqual('beep boop')
      })

      it('should return nothing for nonvalid prop', function () {
        expect(field.value({data: {nvtags: {}}})).toBeFalsy()
        expect(field.value({data: {nvtags: null}})).toBeFalsy()
        expect(field.value({data: {}})).toBeFalsy()
      })
    })
  })

  describe('registered column', function () {
    var column

    beforeEach(function () {
      column = publicServiceAPI.registerColumns.mostRecentCall.args[0]
    })

    describe('.cellContent', function () {
      it('should return the tags as a space separated string', function () {
        var file = {data: {nvtags: ['beep', 'boop']}}
        var cellContent = column.cellContent(file)

        expect(cellContent).toEqual(jasmine.any(Array))
        expect(cellContent[0]).toEqual({
          attrs: jasmine.any(Object),
          content: 'beep'
        })
      })

      it('should return nothing for nonvalid prop', function () {
        expect(column.cellContent({data: {nvtags: {}}})).toBeFalsy()
        expect(column.cellContent({data: {nvtags: null}})).toBeFalsy()
        expect(column.cellContent({data: {}})).toBeFalsy()
      })
    })
  })

  describe('registered file-writer', function () {
    var fileReader, fileWriter

    beforeEach(function () {
      fileReader = publicServiceAPI.registerFileReaders.mostRecentCall.args[0]
      fileWriter = publicServiceAPI.registerFileWriters.mostRecentCall.args[0]
    })

    describe('.write', function () {
      it('should tags to file of given path', function () {
        var readSpy = jasmine.createSpy('fileReader.read')
        var writeSpy = jasmine.createSpy('fileWriter.write')
        var tmpFile = temp.createWriteStream('tmp')
        tmpFile.write('foo')
        tmpFile.end()
        fileWriter.write(tmpFile.path, 'beep boop', writeSpy)

        waitsFor(function () {
          return writeSpy.calls.length >= 1
        })
        runs(function () {
          expect(writeSpy.mostRecentCall.args[0]).toBeFalsy()
          expect(writeSpy.mostRecentCall.args[1]).toBeFalsy()
          fileReader.read(tmpFile.path, readSpy)
        })

        // assumes fileReader working/tested in-depth separately
        waitsFor(function () {
          return readSpy.calls.length >= 1
        })
        runs(function () {
          expect(readSpy.mostRecentCall.args[0]).toBeFalsy()
          expect(readSpy.mostRecentCall.args[1]).toEqual(['beep', 'boop'])
        })
      })
    })
  })
})
