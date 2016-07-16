'use babel'

import Path from 'path'
import R from 'ramda'
import fs from 'fs'
import temp from 'temp'
import prepFile from '../lib/prep-file'
import PathWatcher from '../lib/path-watcher'

temp.track()

describe('workers/path-watcher', () => {
  let File

  beforeEach(function () {
    jasmine.useRealClock()

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
    this.unsubInitialScanDone = this.pathWatcher.initialScanDoneProp.onValue(this.readySpy)
    this.unsubFilesProp = this.pathWatcher.filesProp.onValue(this.filesSpy)
  })

  afterEach(function () {
    this.unsubInitialScanDone()
    this.unsubFilesProp()
    this.pathWatcher.dispose()
    temp.cleanupSync()
  })

  it('should not be ready initially', function () {
    expect(this.readySpy).toHaveBeenCalledWith(false)
  })

  it('should have an empty files list', function () {
    expect(this.filesSpy).toHaveBeenCalledWith([])
  })

  describe('when all files in path has been scanned', function () {
    beforeEach(function () {
      waitsFor(() => {
        return this.readySpy.calls.length === 2
      })
      runs(() => {
        expect(this.readySpy.calls[1].args[0]).toBe(true)
      })
    })

    it('should have files', function () {
      expect(this.filesSpy.calls[1].args[0]).toEqual(R.repeat(jasmine.any(File), 3))
      expect(this.filesSpy.calls[2].args[0][1].path).toMatch(/.+file-1\.txt$/)
      expect(this.filesSpy.calls[3].args[0][2].path).toMatch(/.+file-2\.txt$/)
    })

    describe('when file reads are done', function () {
      beforeEach(function () {
        waitsFor(() => {
          return this.filesSpy.calls.length >= 7
        })
      })

      it('should contain files with contents', function () {
        expect(this.filesSpy.mostRecentCall.args[0][0].content).toEqual('1')
        expect(this.filesSpy.mostRecentCall.args[0][1].content).toEqual('2')
        expect(this.filesSpy.mostRecentCall.args[0][2].content).toEqual('3')
      })

      describe('when a file is changed', function () {
        beforeEach(function () {
          this.prev = this.filesSpy.mostRecentCall.args[0]

          this.filesSpy.reset()
          fs.writeFileSync(Path.join(this.realPath, 'file-0.txt'), 'meh something longert han one word')

          waitsFor(() => {
            return this.filesSpy.calls.length >= 1
          })
        })

        it('should update changed file', function () {
          expect(this.filesSpy.mostRecentCall.args[0]).not.toBe(this.prev)
        })
      })

      describe('when files are removed', function () {
        it('should be reflected on the files prop', function () {
          this.filesSpy.reset()
          fs.unlinkSync(Path.join(this.realPath, 'file-0.txt'))
          fs.unlinkSync(Path.join(this.realPath, 'file-1.txt'))
          fs.unlinkSync(Path.join(this.realPath, 'other.zip'))
          fs.unlinkSync(Path.join(this.realPath, 'file-2.txt'))

          waitsFor(() => {
            return this.filesSpy.calls.length >= 4
          })
          runs(() => {
            expect(this.filesSpy.calls[0].args[0].length).toEqual(2)
            expect(this.filesSpy.calls[1].args[0].length).toEqual(1)
            expect(this.filesSpy.calls[2].args[0].length).toEqual(1)
            expect(this.filesSpy.calls[3].args[0].length).toEqual(0)
          })
        })
      })
    })
  })
})
