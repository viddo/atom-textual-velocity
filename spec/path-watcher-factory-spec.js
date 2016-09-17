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
    const fieldsProp = Bacon.constant([
      {filePropName: 'name'},
      {filePropName: 'contentAsInt', value: file => parseInt(file.content)}
    ])
    pathWatcherFactory = new PathWatcherFactory({
      fileReadersProp: fileReadersProp,
      fieldsProp: fieldsProp
    })
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

      this.sifterPropSpy = jasmine.createSpy('sifterProp')
      this.initialScanDonePropSpy = jasmine.createSpy('initialScanDoneProp')
      this.pathWatcher = pathWatcherFactory.watch(this.notesPath, this.notesFileFilter)
      this.unsubInitialScanDone = this.pathWatcher.initialScanDoneProp.onValue(this.initialScanDonePropSpy)
      this.unsubFilesProp = this.pathWatcher.sifterProp.onValue(this.sifterPropSpy)
    })

    afterEach(function () {
      this.unsubInitialScanDone()
      this.unsubFilesProp()
      this.pathWatcher.dispose()
      temp.cleanupSync()
    })

    it('should return a watcher that handles the life-cycle of a given path', function () {
      expect(this.initialScanDonePropSpy).not.toHaveBeenCalled() // initialScanDone should not be ready initially
      expect(this.sifterPropSpy.calls[0].args[0].items).toEqual([], 'items should be an empty list initially')

      waitsFor('watcher to be ready', () => {
        return this.initialScanDonePropSpy.calls.length >= 1
      })
      runs(() => {
        expect(this.initialScanDonePropSpy.mostRecentCall.args[0]).toEqual(true, 'initialScanDone should be ready')
        expect(this.sifterPropSpy.calls[1].args[0].items).toEqual(R.repeat(jasmine.any(Object), 3), 'files should have some entries')
        expect(this.sifterPropSpy.calls[2].args[0].items[1].path).toMatch(/.+file-1\.txt$/, 'file should have a path')
        expect(this.sifterPropSpy.calls[3].args[0].items[2].path).toMatch(/.+file-2\.txt$/, 'file should have a path')
      })

      waitsFor('all files to be read', () => {
        return this.sifterPropSpy.calls.length >= 7
      })
      runs(() => {
        const files = this.sifterPropSpy.mostRecentCall.args[0].items
        expect(files[0].content).toEqual('1', 'file should have content')
        expect(files[1].content).toEqual('2', 'file should have content')
        expect(files[2].content).toEqual('3', 'file should have content')

        expect(files[0].contentAsInt).toEqual(1)
      })

      runs(() => {
        this.prevContent = this.sifterPropSpy.mostRecentCall.args[0].items[0].content
        this.sifterPropSpy.reset()
        fs.writeFileSync(Path.join(this.realPath, 'file-0.txt'), 'meh something longer than one word')
      })
      waitsFor('file change', () => {
        return this.sifterPropSpy.calls.length >= 2
      })
      runs(() => {
        const files = this.sifterPropSpy.mostRecentCall.args[0].items
        expect(files[0].content).not.toEqual(this.prevContent, 'should have updated changed file')
        expect(files[0].contentAsInt).toBeNaN(NaN, 'should have updated field value')
      })

      runs(() => {
        this.sifterPropSpy.reset()
        fs.unlinkSync(Path.join(this.realPath, 'file-0.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'file-1.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'other.zip'))
      })
      waitsFor('for all files to have been removed', () => {
        return this.sifterPropSpy.calls.length >= 2
      })
      runs(() => {
        expect(this.sifterPropSpy.calls[1].args[0].items.length).toEqual(1)
        expect(this.sifterPropSpy.calls[1].args[0].items[0].relPath).toEqual('file-2.txt')
      })
    })
  })
})
