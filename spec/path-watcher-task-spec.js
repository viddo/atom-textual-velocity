/* @flow */

import {Task} from 'atom'
import fs from 'fs'
import Path from 'path'
import temp from 'temp'

temp.track()

describe('path-watcher-task', () => {
  let task, dir, addSpy, changeSpy, unlinkSpy

  beforeEach(function () {
    const tempDirPath = temp.mkdirSync('empty-dir')
    dir = fs.realpathSync(tempDirPath)

    fs.writeFileSync(Path.join(dir, 'note-1.txt'), '1')
    fs.writeFileSync(Path.join(dir, 'note-2.txt'), '2')
    fs.writeFileSync(Path.join(dir, 'other.zip'), '...')
    fs.writeFileSync(Path.join(dir, 'note-3.txt'), '3')

    const taskPath = Path.join(__dirname, '..', 'lib', 'path-watcher-task.js')
    task = new Task(taskPath)

    addSpy = jasmine.createSpy('add')
    changeSpy = jasmine.createSpy('change')
    unlinkSpy = jasmine.createSpy('unlink')
    task.on('add', addSpy)
    task.on('change', changeSpy)
    task.on('unlink', unlinkSpy)

    let done = false
    task.on('ready', () => {
      done = true
    })
    task.start(dir)
    waitsFor(() => done) // implicitly test INITIAL_SCAN_DONE
  })

  afterEach(function () {
    temp.cleanupSync()
    task.send('dispose')
    task.terminate()
  })

  it('should yield add events for each file found in dir', function () {
    expect(addSpy).toHaveBeenCalled()
    expect(addSpy.calls.length).toEqual(4)
    expect(addSpy.calls[0].args[0].filename).toEqual(jasmine.any(String))
    expect(addSpy.calls[0].args[0].stats).toEqual(jasmine.any(Object))
  })

  describe('when a new file is created', function () {
    beforeEach(function () {
      addSpy.reset()
      fs.writeFileSync(Path.join(dir, 'note-4.txt'), '4')
      waitsFor(() => addSpy.calls.length >= 1)
    })

    it('should yield a new file add event', function () {
      expect(addSpy.calls[0].args[0].filename).toEqual('note-4.txt')
      expect(addSpy.calls[0].args[0].stats).toEqual(jasmine.any(Object))
    })
  })

  describe('when change file', function () {
    beforeEach(function () {
      changeSpy.reset()
      fs.writeFileSync(Path.join(dir, 'note-1.txt'), '111')
      waitsFor(() => changeSpy.calls.length >= 1)
    })

    it('should yield a change event', function () {
      expect(changeSpy.calls[0].args[0].filename).toEqual('note-1.txt')
      expect(changeSpy.calls[0].args[0].stats).toEqual(jasmine.any(Object))
    })
  })

  describe('when delete file', function () {
    beforeEach(function () {
      unlinkSpy.reset()
      fs.unlinkSync(Path.join(dir, 'note-1.txt'))
      waitsFor(() => unlinkSpy.calls.length >= 1)
    })

    it('should yield a unlink event with filename', function () {
      expect(unlinkSpy.calls[0].args[0]).toEqual('note-1.txt')
    })
  })
})
