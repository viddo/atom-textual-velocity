/* @flow */

import fs from 'fs'
import Path from 'path'
import temp from 'temp'
import {createEpicMiddleware} from 'redux-observable'
import configureMockStore from 'redux-mock-store'
import pathWatcherEpic from '../../lib/epics/path-watcher'
import * as A from '../../lib/action-creators'

const epicMiddleware = createEpicMiddleware(pathWatcherEpic)
const mockStore = configureMockStore([epicMiddleware])

describe('epics/path-watcher', () => {
  let dir, store

  beforeEach(() => {
    const tempDirPath = temp.mkdirSync('empty-dir')
    dir = fs.realpathSync(tempDirPath)

    fs.writeFileSync(Path.join(dir, 'note-1.txt'), '1')
    fs.writeFileSync(Path.join(dir, 'note-2.txt'), '2')
    fs.writeFileSync(Path.join(dir, 'other.zip'), '...')
    fs.writeFileSync(Path.join(dir, 'note-3.txt'), '3')

    atom.config.set('textual-velocity.path', dir)
    atom.config.set('textual-velocity.ignoredNames', ['.DS_Store'])
    store = mockStore()
  })

  afterEach(function () {
    store.dispatch(A.dispose()) // should terminate any running processes
    epicMiddleware.replaceEpic(pathWatcherEpic)
    temp.cleanupSync()
  })

  describe('when start-initial-scan action is triggered', function () {
    beforeEach(function () {
      store.dispatch(A.startInitialScan())

      // wait for initial scan to be done (i.e. the last expected action), implicitly verifies that to work, too
      waitsFor(() => store.getActions().slice(-1)[0].type === A.INITIAL_SCAN_DONE)
    })

    it('should have yielded file-added actions for each file', function () {
      expect(store.getActions().length).toEqual(5)

      const [, action] = store.getActions()
      expect(action.type).toEqual(A.FILE_ADDED)
      expect(action.rawFile).toEqual(jasmine.any(Object))
      expect(action.rawFile.filename).toEqual('note-1.txt')
    })

    it('should have converted stats strings to date object', function () {
      const [, action] = store.getActions()
      expect(action.rawFile.stats).toEqual(jasmine.any(Object))
      expect(action.rawFile.stats.atime).toEqual(jasmine.any(Date))
      expect(action.rawFile.stats.birthtime).toEqual(jasmine.any(Date))
      expect(action.rawFile.stats.ctime).toEqual(jasmine.any(Date))
      expect(action.rawFile.stats.mtime).toEqual(jasmine.any(Date))
    })

    describe('when a new file is created', function () {
      beforeEach(function () {
        store.clearActions()
        fs.writeFileSync(Path.join(dir, 'note-4.txt'), '4')
        waitsFor(() => store.getActions().length >= 1)
      })

      it('should yield a file-added action', function () {
        expect(store.getActions()[0].type).toEqual(A.FILE_ADDED)
      })

      it('should have a rawFile on action', function () {
        const rawFile = store.getActions()[0].rawFile
        expect(rawFile).toEqual(jasmine.any(Object))
        expect(rawFile.filename).toEqual('note-4.txt')

        expect(rawFile.stats).toEqual(jasmine.any(Object))
        expect(rawFile.stats.atime).toEqual(jasmine.any(Date))
        expect(rawFile.stats.birthtime).toEqual(jasmine.any(Date))
        expect(rawFile.stats.ctime).toEqual(jasmine.any(Date))
        expect(rawFile.stats.mtime).toEqual(jasmine.any(Date))
      })
    })

    describe('when change file', function () {
      beforeEach(function () {
        store.clearActions()
        fs.writeFileSync(Path.join(dir, 'note-1.txt'), '111')
        waitsFor(() => store.getActions().length >= 1)
      })

      it('should yield a file-changed action', function () {
        expect(store.getActions()[0].type).toEqual(A.FILE_CHANGED)
      })

      it('should have a rawFile on action', function () {
        const rawFile = store.getActions()[0].rawFile
        expect(rawFile).toEqual(jasmine.any(Object))
        expect(rawFile.filename).toEqual('note-1.txt')

        expect(rawFile.stats).toEqual(jasmine.any(Object))
        expect(rawFile.stats.atime).toEqual(jasmine.any(Date))
        expect(rawFile.stats.birthtime).toEqual(jasmine.any(Date))
        expect(rawFile.stats.ctime).toEqual(jasmine.any(Date))
        expect(rawFile.stats.mtime).toEqual(jasmine.any(Date))
      })
    })

    describe('when delete file', function () {
      beforeEach(function () {
        store.clearActions()
        fs.unlinkSync(Path.join(dir, 'note-1.txt'))
        waitsFor(() => store.getActions().length >= 1)
      })

      it('should yield a unlink action with deleted filename', function () {
        expect(store.getActions()[0].type).toEqual(A.FILE_DELETED)
        expect(store.getActions()[0].filename).toEqual('note-1.txt')
      })
    })
  })
})
