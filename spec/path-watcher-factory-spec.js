'use babel'

import Bacon from 'baconjs'
import fs from 'fs'
import Path from 'path'
import R from 'ramda'
import temp from 'temp'
import NotesFileFilter from '../lib/notes-file-filter'
import NotesPath from '../lib/notes-path'
import contentFileReader from '../lib/file-readers/content-file-reader'
import statsFileReader from '../lib/file-readers/stats-file-reader'
import PathWatcherFactory from '../lib/path-watcher-factory'

temp.track()

describe('path-watcher-factory', () => {
  let pathWatcherFactory

  beforeEach(function () {
    jasmine.useRealClock()
    const fileReadersProp = Bacon.constant([
      contentFileReader,
      statsFileReader
    ])
    pathWatcherFactory = new PathWatcherFactory(fileReadersProp)
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
      expect(this.initialScanDoneSpy).not.toHaveBeenCalled() // initialScanDone should not be ready initially
      expect(this.filesSpy.calls[0].args[0]).toEqual([], 'files should be an empty list initially')

      waitsFor('watcher to be ready', () => {
        return this.initialScanDoneSpy.calls.length >= 1
      })
      runs(() => {
        expect(this.initialScanDoneSpy.mostRecentCall.args[0]).toEqual(true, 'initialScanDone should be ready')
        expect(this.filesSpy.calls[1].args[0]).toEqual(R.repeat(jasmine.any(Object), 3), 'files should have some entries')
        expect(this.filesSpy.calls[2].args[0][1].path).toMatch(/.+file-1\.txt$/, 'file should have a path')
        expect(this.filesSpy.calls[3].args[0][2].path).toMatch(/.+file-2\.txt$/, 'file should have a path')
      })

      waitsFor('all files to be read', () => {
        return this.filesSpy.calls.length >= 7
      })
      runs(() => {
        const files = this.filesSpy.mostRecentCall.args[0]
        expect(files[0].data.content).toEqual('1', 'file should have content')
        expect(files[1].data.content).toEqual('2', 'file should have content')
        expect(files[2].data.content).toEqual('3', 'file should have content')
      })

      runs(() => {
        this.prevContent = this.filesSpy.mostRecentCall.args[0][0].data.content
        this.filesSpy.reset()
        fs.writeFileSync(Path.join(this.realPath, 'file-0.txt'), 'meh something longer than one word')
      })
      waitsFor('file change', () => {
        return this.filesSpy.calls.length >= 2
      })
      runs(() => {
        expect(this.filesSpy.mostRecentCall.args[0][0].data.content).not.toEqual(this.prevContent, 'should have updated changed file')
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
