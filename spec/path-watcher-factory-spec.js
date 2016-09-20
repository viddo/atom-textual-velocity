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
    const fileReadersP = Bacon.constant([
      contentFileReader,
      statsFileReader
    ])
    const fieldsP = Bacon.constant([
      {filePropName: 'name'},
      {filePropName: 'contentAsInt', value: file => parseInt(file.content)}
    ])
    pathWatcherFactory = new PathWatcherFactory({
      fileReadersP: fileReadersP,
      fieldsP: fieldsP
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

      this.sifterPSpy = jasmine.createSpy('sifterP')
      this.initialScanDonePSpy = jasmine.createSpy('initialScanDoneP')
      this.pathWatcher = pathWatcherFactory.watch(this.notesPath, this.notesFileFilter)
      this.unsubInitialScanDone = this.pathWatcher.initialScanDoneP.onValue(this.initialScanDonePSpy)
      this.unsubFilesP = this.pathWatcher.sifterP.onValue(this.sifterPSpy)
    })

    afterEach(function () {
      this.unsubInitialScanDone()
      this.unsubFilesP()
      this.pathWatcher.dispose()
      temp.cleanupSync()
    })

    it('should return a watcher that handles the life-cycle of a given path', function () {
      expect(this.sifterPSpy.calls[0].args[0].items).toEqual([], 'items should be an empty list initially')

      waitsFor('watcher to be ready', () => {
        return this.initialScanDonePSpy.calls.length >= 1
      })
      runs(() => {
        expect(this.initialScanDonePSpy.mostRecentCall.args[0]).toEqual(true, 'initialScanDone should be ready')
        expect(this.sifterPSpy.calls[1].args[0].items).toEqual(R.repeat(jasmine.any(Object), 3), 'files should have some entries')
        expect(this.sifterPSpy.calls[2].args[0].items[1].path).toMatch(/.+file-1\.txt$/, 'file should have a path')
        expect(this.sifterPSpy.calls[3].args[0].items[2].path).toMatch(/.+file-2\.txt$/, 'file should have a path')
      })

      waitsFor('all files to be read', () => {
        return this.sifterPSpy.calls.length >= 7
      })
      runs(() => {
        const files = this.sifterPSpy.mostRecentCall.args[0].items
        expect(files[0].content).toEqual('1', 'file should have content')
        expect(files[1].content).toEqual('2', 'file should have content')
        expect(files[2].content).toEqual('3', 'file should have content')

        expect(files[0].contentAsInt).toEqual(1)
      })

      runs(() => {
        this.prevContent = this.sifterPSpy.mostRecentCall.args[0].items[0].content
        this.sifterPSpy.reset()
        fs.writeFileSync(Path.join(this.realPath, 'file-0.txt'), 'meh something longer than one word')
      })
      waitsFor('file change', () => {
        return this.sifterPSpy.calls.length >= 2
      })
      runs(() => {
        const files = this.sifterPSpy.mostRecentCall.args[0].items
        expect(files[0].content).not.toEqual(this.prevContent, 'should have updated changed file')
        expect(files[0].contentAsInt).toBeNaN(NaN, 'should have updated field value')
      })

      runs(() => {
        this.sifterPSpy.reset()
        fs.unlinkSync(Path.join(this.realPath, 'file-0.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'file-1.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'other.zip'))
      })
      waitsFor('for all files to have been removed', () => {
        return this.sifterPSpy.calls.length >= 2
      })
      runs(() => {
        expect(this.sifterPSpy.calls[1].args[0].items.length).toEqual(1)
        expect(this.sifterPSpy.calls[1].args[0].items[0].relPath).toEqual('file-2.txt')
      })
    })
  })
})
