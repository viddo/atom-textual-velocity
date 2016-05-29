'use babel'

import Path from 'path'
import R from 'ramda'
import fs from 'fs'
import temp from 'temp'
import prepFile from '../../lib/value-objects/prep-file'
import PathWatcher from '../../lib/workers/path-watcher'
import fixToEqualJasmineAny from '../fix-to-equal-jasmine-any'

temp.track()
fixToEqualJasmineAny()

describe('workers/path-watcher', () => {
  let File

  beforeEach(function () {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce

    const tempDirPath = temp.mkdirSync('empty-dir')
    this.realPath = fs.realpathSync(tempDirPath)

    fs.writeFileSync(Path.join(this.realPath, 'file-0.txt'), '1')
    fs.writeFileSync(Path.join(this.realPath, 'file-1.txt'), '2')
    fs.writeFileSync(Path.join(this.realPath, 'other.zip'), '')
    fs.writeFileSync(Path.join(this.realPath, 'file-2.txt'), '3')

    File = prepFile(this.realPath)

    this.pathWatcher = new PathWatcher({
      rootPath: this.realPath,
      File: File
    })

    this.filesSpy = jasmine.createSpy('files')
    this.readySpy = jasmine.createSpy('ready')
    this.unsubInitialScanDone = this.pathWatcher.initialScanDoneProp().onValue(this.readySpy)
    this.unsubFilesProp = this.pathWatcher.filesProp().onValue(this.filesSpy)
  })

  afterEach(function () {
    this.unsubInitialScanDone()
    this.unsubFilesProp()
    this.pathWatcher.dispose()
    temp.cleanupSync()
  })

  it('should not be ready initially', function () {
    expect(this.readySpy.calls[0].args[0]).toBe(false)
  })

  it('should have an empty files list', function () {
    expect(this.filesSpy.calls[0].args[0]).toEqual([])
  })

  describe('when all files in path has been scanned', function () {
    beforeEach(function () {
      waitsFor(() => {
        return this.readySpy.calls.length >= 2
      })
      waitsFor(() => {
        return !!this.readySpy.calls[1].args[0]
      })
    })

    it('should have files', function () {
      expect(this.filesSpy.calls[1].args[0]).toEqual(R.repeat(jasmine.any(File), 3))
      expect(this.filesSpy.calls[2].args[0][1].path()).toMatch(/.+file-1\.txt$/)
      expect(this.filesSpy.calls[3].args[0][2].path()).toMatch(/.+file-2\.txt$/)
    })

    describe('when a file is changed', function () {
      beforeEach(function () {
        fs.writeFileSync(Path.join(this.realPath, 'file-0.txt'), 'meh something longert han one word')

        waitsFor(() => {
          return this.filesSpy.calls.length >= 5
        })
      })

      it('should update changed file', function () {
        const prev = this.filesSpy.calls[3].args[0]
        const current = this.filesSpy.calls[4].args[0]

        expect(current).not.toBe(prev)
      })
    })

    describe('when files are removed', function () {
      it('should be reflected on the files prop', function () {
        fs.unlinkSync(Path.join(this.realPath, 'file-0.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'file-1.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'other.zip'))
        fs.unlinkSync(Path.join(this.realPath, 'file-2.txt'))

        waitsFor(() => {
          return this.filesSpy.calls.length >= 8
        })
        runs(() => {
          expect(this.filesSpy.calls[4].args[0].length).toEqual(2)
          expect(this.filesSpy.calls[5].args[0].length).toEqual(1)

          expect(this.filesSpy.calls[7].args[0].length).toEqual(0)
        })
      })
    })
  })
})
