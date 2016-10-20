'use babel'

import Bacon from 'baconjs'
import fs from 'fs'
import temp from 'temp'
import NotesFileFilter from '../lib/notes-file-filter'
import NotesPath from '../lib/notes-path'
import contentFileReader from '../lib/file-readers/content-file-reader'
import PathWatcherFactory from '../lib/path-watcher-factory'

temp.track()

describe('path-watcher-factory', () => {
  let pathWatcherFactory, testFileReader

  beforeEach(function () {
    jasmine.useRealClock()

    testFileReader = {
      read: (path, stats, callback) => callback(null, path),
      notePropName: 'test'
    }
    spyOn(testFileReader, 'read').andCallThrough()

    const fileReadersP = Bacon.constant([
      contentFileReader,
      testFileReader
    ])
    const fieldsP = Bacon.constant([
      {notePropName: 'name'},
      {notePropName: 'contentAsInt', value: note => parseInt(note.content)}
    ])
    pathWatcherFactory = new PathWatcherFactory({
      fileReadersP: fileReadersP,
      fieldsP: fieldsP
    })
  })

  describe('.watch', function () {
    let newFilenameSpy, notesCache, notesFileFilter, notesPath, sifterPSpy, initialScanDonePSpy, pathWatcher, prevContent, unsubInitialScanDone, unsubFilesP, unsubNewFilename

    beforeEach(function () {
      const tempDirPath = temp.mkdirSync('empty-dir')
      const realPath = fs.realpathSync(tempDirPath)
      notesFileFilter = new NotesFileFilter(realPath)
      notesPath = NotesPath(realPath)

      fs.writeFileSync(notesPath.fullPath('note-1.txt'), '1')
      fs.writeFileSync(notesPath.fullPath('note-2.txt'), '2')
      fs.writeFileSync(notesPath.fullPath('other.zip'), '')
      fs.writeFileSync(notesPath.fullPath('note-3.txt'), '3')

      sifterPSpy = jasmine.createSpy('sifterP')
      initialScanDonePSpy = jasmine.createSpy('initialScanDoneP')
      newFilenameSpy = jasmine.createSpy('newFilenameS')
    })

    afterEach(function () {
      temp.cleanupSync()
    })

    describe('when called without cached notes', function () {
      beforeEach(function () {
        notesCache = {}
        pathWatcher = pathWatcherFactory.watch(notesCache, notesPath, notesFileFilter)

        unsubInitialScanDone = pathWatcher.initialScanDoneP.onValue(initialScanDonePSpy)
        unsubNewFilename = pathWatcher.newFilenameS.onValue(newFilenameSpy)
        unsubFilesP = pathWatcher.sifterP.onValue(sifterPSpy)
      })

      afterEach(function () {
        unsubInitialScanDone()
        unsubNewFilename()
        unsubFilesP()
        pathWatcher.dispose()
      })

      it('should return a watcher that handles the life-cycle of a given path', function () {
        expect(sifterPSpy.calls[0].args[0].items).toEqual({}, 'items should be an empty list initially')

        waitsFor('watcher to be ready', () => {
          return initialScanDonePSpy.calls.length >= 1
        })
        runs(() => {
          expect(initialScanDonePSpy.mostRecentCall.args[0]).toEqual(true, 'initialScanDone should be ready')
          expect(sifterPSpy.calls[1].args[0].items).toEqual(jasmine.any(Object), 'notes should have some entries')
          expect(sifterPSpy.calls[2].args[0].items['note-1.txt']).toBeDefined()
          expect(sifterPSpy.calls[3].args[0].items['note-3.txt']).toBeDefined()
          expect(newFilenameSpy.mostRecentCall.args[0]).toEqual('note-3.txt')
        })

        waitsFor('all notes to be read', () => {
          const notes = sifterPSpy.mostRecentCall.args[0].items
          return Object.keys(notes).every(filename => notes[filename].ready)
        })
        runs(() => {
          const notes = sifterPSpy.mostRecentCall.args[0].items
          expect(notes['note-1.txt'].content).toEqual('1', 'note should have content')
          expect(notes['note-2.txt'].content).toEqual('2', 'note should have content')
          expect(notes['note-3.txt'].content).toEqual('3', 'note should have content')

          expect(notes['note-1.txt'].contentAsInt).toEqual(1, 'should update fields')
          expect(notes['note-2.txt'].contentAsInt).toEqual(2, 'should update fields')
          expect(notes['note-3.txt'].contentAsInt).toEqual(3, 'should update fields')
        })

        runs(() => {
          prevContent = sifterPSpy.mostRecentCall.args[0].items['note-1.txt'].content
          sifterPSpy.reset()
          fs.writeFileSync(notesPath.fullPath('note-1.txt'), 'meh something longer than one word')
        })
        waitsFor('note content change', () => {
          return sifterPSpy.calls.length >= 2
        })
        runs(() => {
          const notes = sifterPSpy.mostRecentCall.args[0].items
          expect(notes['note-1.txt'].content).not.toEqual(prevContent, 'should have updated changed note')
          expect(notes['note-1.txt'].contentAsInt).toBeNaN(NaN, 'should have updated field value')
        })

        runs(() => {
          sifterPSpy.reset()
          fs.unlinkSync(notesPath.fullPath('note-1.txt'))
          fs.unlinkSync(notesPath.fullPath('note-2.txt'))
          fs.unlinkSync(notesPath.fullPath('other.zip'))
        })
        waitsFor('for all notes to have been removed', () => {
          return sifterPSpy.calls.length >= 2
        })
        runs(() => {
          expect(Object.keys(sifterPSpy.calls[1].args[0].items).length).toEqual(1, 'should only have one note left')
          expect(sifterPSpy.calls[1].args[0].items['note-3.txt']).toBeDefined()
        })
      })
    })

    describe('when called with cached notes', function () {
      let notesCache

      beforeEach(function () {
        notesCache = {
          'note-1.txt': { // note that have all values read, not changed
            stats: fs.statSync(notesPath.fullPath('note-1.txt')),
            name: 'note-1',
            ext: '.txt',
            content: '1',
            contentAsInt: 1,
            test: 'already read value by testFileReader'
          },
          'note-2.txt': { // note that is missing testFileReader value
            stats: fs.statSync(notesPath.fullPath('note-2.txt')),
            name: 'note-2',
            ext: '.txt',
            content: '2'
          },
          'no-longer-existing.txt': {
            stats: {
              mtime: new Date()
            }
          }
        }
        pathWatcher = pathWatcherFactory.watch(notesCache, notesPath, notesFileFilter)

        unsubInitialScanDone = pathWatcher.initialScanDoneP.onValue(initialScanDonePSpy)
        unsubFilesP = pathWatcher.sifterP.onValue(sifterPSpy)
      })

      it('should return a watcher that handles the life-cycle of a given path', function () {
        expect(sifterPSpy.calls[0].args[0].items).toEqual(notesCache, 'items should be the cached list')

        waitsFor('watcher to be ready', () => {
          return initialScanDonePSpy.calls.length >= 1
        })
        runs(() => {
          expect(initialScanDonePSpy.mostRecentCall.args[0]).toEqual(true, 'initialScanDone should be ready')
          expect(sifterPSpy.calls[1].args[0].items).toEqual(jasmine.any(Object), 'notes should have some entries')
          expect(sifterPSpy.calls[2].args[0].items['note-1.txt']).toBeDefined()
          expect(sifterPSpy.calls[3].args[0].items['note-3.txt']).toBeDefined()
          expect(sifterPSpy.calls[3].args[0].items['no-longer-existing.txt']).toBeUndefined()
        })

        waitsFor('all notes to be read', () => {
          const notes = sifterPSpy.mostRecentCall.args[0].items
          return Object.keys(notes).every(filename => notes[filename].ready)
        })
        runs(() => {
          expect(testFileReader.read.calls.length).toEqual(2, 'should only call testFileReader for non-cached files')

          const notes = sifterPSpy.mostRecentCall.args[0].items
          expect(notes['note-1.txt'].content).toEqual('1', 'note should have content')
          expect(notes['note-1.txt'].test).toEqual('already read value by testFileReader', 'note should have cached value')

          expect(notes['note-2.txt'].content).toEqual('2', 'note should have content')
          expect(notes['note-2.txt'].test).toMatch(/note-2.txt$/, 'note should have read missing test value')

          expect(notes['note-3.txt'].content).toEqual('3', 'note should have content')
          expect(notes['note-3.txt'].test).toEqual(jasmine.any(String), 'note should have test value')

          expect(notes['note-1.txt'].contentAsInt).toEqual(1, 'should update fields')
          expect(notes['note-2.txt'].contentAsInt).toEqual(2, 'should update fields')
          expect(notes['note-3.txt'].contentAsInt).toEqual(3, 'should update fields')

          expect(Object.keys(notes).length).toEqual(3, 'should have removed non-existing notes from previous cache')
        })

        runs(() => {
          testFileReader.read.reset()
          fs.writeFileSync(notesPath.fullPath('note-1.txt'), 'meh something longer than one word')
        })
        waitsFor('note content change', () => {
          return sifterPSpy.mostRecentCall.args[0].items['note-1.txt'].content !== '1' // should have updated changed note
        })
        runs(() => {
          expect(testFileReader.read).toHaveBeenCalled()
          expect(sifterPSpy.mostRecentCall.args[0].items['note-1.txt'].contentAsInt).toBeNaN(NaN, 'should have updated field value')
        })

        runs(() => {
          sifterPSpy.reset()
          fs.unlinkSync(notesPath.fullPath('note-1.txt'))
          fs.unlinkSync(notesPath.fullPath('note-2.txt'))
          fs.unlinkSync(notesPath.fullPath('other.zip'))
        })
        waitsFor('for notes of deleted files to have been removed', () => {
          return sifterPSpy.calls.length >= 2
        })
        runs(() => {
          expect(Object.keys(sifterPSpy.calls[1].args[0].items).length).toEqual(1, 'should only have one note left')
          expect(sifterPSpy.calls[1].args[0].items['note-3.txt']).toBeDefined()
        })
      })
    })
  })
})
