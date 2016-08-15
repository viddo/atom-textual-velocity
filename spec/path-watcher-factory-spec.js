'use babel'

import Path from 'path'
import R from 'ramda'
import fs from 'fs'
import temp from 'temp'
import NotesPath from '../lib/notes-path'
import NotesFileFilter from '../lib/notes-file-filter'
import * as pathWatcherFactory from '../lib/path-watcher-factory'

temp.track()

describe('path-watcher-factory', () => {
  beforeEach(function () {
    jasmine.useRealClock()
  })

  describe('.watch', function () {
    beforeEach(function () {
      const tempDirPath = temp.mkdirSync('empty-dir')
      this.realPath = fs.realpathSync(tempDirPath)

      fs.writeFileSync(Path.join(this.realPath, 'file-0.txt'), '1')
      fs.writeFileSync(Path.join(this.realPath, 'file-1.txt'), '2')
      fs.writeFileSync(Path.join(this.realPath, 'other.zip'), '')
      fs.writeFileSync(Path.join(this.realPath, 'file-2.txt'), '3')

      this.notesPath = NotesPath(this.realPath)
      this.notesFileFilter = new NotesFileFilter(this.realPath)

      this.filesSpy = jasmine.createSpy('files')
      this.initialScanDoneSpy = jasmine.createSpy('ready')
      this.pathWatcher = pathWatcherFactory.watch(this.notesPath, this.notesFileFilter)
      this.unsubInitialScanDone = this.pathWatcher.initialScanDoneProp.onValue(this.initialScanDoneSpy)
      this.unsubFilesProp = this.pathWatcher.filesProp.onValue(this.filesSpy)
    })

    afterEach(function () {
      this.unsubInitialScanDone()
      this.unsubFilesProp()
      this.pathWatcher.dispose()
      temp.cleanupSync()
    })

    it('should return a watcher that handles the life-cycle of a given path', function () {
      expect(this.initialScanDoneSpy.calls[0].args[0]).toEqual(false, 'initialScanDone should not be ready initially')
      expect(this.filesSpy.calls[0].args[0]).toEqual([], 'files should be an empty list initially')

      waitsFor('watcher to be ready', () => {
        return this.initialScanDoneSpy.calls.length === 2
      })
      runs(() => {
        expect(this.initialScanDoneSpy.calls[1].args[0]).toEqual(true, 'initialScanDone should be ready')
        expect(this.filesSpy.calls[1].args[0]).toEqual(R.repeat(jasmine.any(Object), 3), 'files should have some entries')
        expect(this.filesSpy.calls[2].args[0][1].path).toMatch(/.+file-1\.txt$/, 'file should have a path')
        expect(this.filesSpy.calls[3].args[0][2].path).toMatch(/.+file-2\.txt$/, 'file should have a path')
      })

      waitsFor('all files to be read', () => {
        return this.filesSpy.calls.length >= 7
      })
      runs(() => {
        expect(this.filesSpy.mostRecentCall.args[0][0].content).toEqual('1', 'file should have content')
        expect(this.filesSpy.mostRecentCall.args[0][1].content).toEqual('2', 'file should have content')
        expect(this.filesSpy.mostRecentCall.args[0][2].content).toEqual('3', 'file should have content')
      })

      runs(() => {
        this.prev = this.filesSpy.mostRecentCall.args[0]
        this.filesSpy.reset()
        fs.writeFileSync(Path.join(this.realPath, 'file-0.txt'), 'meh something longer than one word')
      })
      waitsFor('file change', () => {
        return this.filesSpy.calls.length >= 1
      })
      runs(() => {
        expect(this.filesSpy.mostRecentCall.args[0]).not.toBe(this.prev, 'should have updated changed file')
      })

      runs(() => {
        this.filesSpy.reset()
        fs.unlinkSync(Path.join(this.realPath, 'file-0.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'file-1.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'other.zip'))
        fs.unlinkSync(Path.join(this.realPath, 'file-2.txt'))
      })
      waitsFor('for all files to have been removed', () => {
        return this.filesSpy.calls.length >= 3
      })
      runs(() => {
        expect(this.filesSpy.calls[0].args[0].length).toEqual(2)
        expect(this.filesSpy.calls[1].args[0].length).toEqual(1)
        expect(this.filesSpy.calls[2].args[0].length).toEqual(0)
      })
    })
  })
})
