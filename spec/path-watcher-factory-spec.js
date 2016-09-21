'use babel'

import Bacon from 'baconjs'
import fs from 'fs'
import Path from 'path'
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

      fs.writeFileSync(Path.join(this.realPath, 'note-1.txt'), '1')
      fs.writeFileSync(Path.join(this.realPath, 'note-2.txt'), '2')
      fs.writeFileSync(Path.join(this.realPath, 'other.zip'), '')
      fs.writeFileSync(Path.join(this.realPath, 'note-3.txt'), '3')

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
        expect(this.sifterPSpy.calls[1].args[0].items).toEqual(jasmine.any(Object), 'files should have some entries')
        expect(this.sifterPSpy.calls[2].args[0].items['note-1.txt']).toBeDefined()
        expect(this.sifterPSpy.calls[3].args[0].items['note-3.txt']).toBeDefined()
      })

      waitsFor('all files to be read', () => {
        return this.sifterPSpy.mostRecentCall.args[0].items['note-3.txt'].content
      })
      runs(() => {
        const files = this.sifterPSpy.mostRecentCall.args[0].items
        expect(files['note-1.txt'].content).toEqual('1', 'file should have content')
        expect(files['note-2.txt'].content).toEqual('2', 'file should have content')
        expect(files['note-3.txt'].content).toEqual('3', 'file should have content')

        expect(files['note-1.txt'].contentAsInt).toEqual(1)
      })

      runs(() => {
        this.prevContent = this.sifterPSpy.mostRecentCall.args[0].items['note-1.txt'].content
        this.sifterPSpy.reset()
        fs.writeFileSync(Path.join(this.realPath, 'note-1.txt'), 'meh something longer than one word')
      })
      waitsFor('file change', () => {
        return this.sifterPSpy.calls.length >= 2
      })
      runs(() => {
        const files = this.sifterPSpy.mostRecentCall.args[0].items
        expect(files['note-1.txt'].content).not.toEqual(this.prevContent, 'should have updated changed file')
        expect(files['note-1.txt'].contentAsInt).toBeNaN(NaN, 'should have updated field value')
      })

      runs(() => {
        this.sifterPSpy.reset()
        fs.unlinkSync(Path.join(this.realPath, 'note-1.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'note-2.txt'))
        fs.unlinkSync(Path.join(this.realPath, 'other.zip'))
      })
      waitsFor('for all files to have been removed', () => {
        return this.sifterPSpy.calls.length >= 2
      })
      runs(() => {
        expect(Object.keys(this.sifterPSpy.calls[1].args[0].items).length).toEqual(1, 'shold only have one note left')
        expect(this.sifterPSpy.calls[1].args[0].items['note-3.txt']).toBeDefined()
      })
    })
  })
})
