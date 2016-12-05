'use babel'

import {Task} from 'atom'
import fs from 'fs'
import Path from 'path'
import temp from 'temp'

temp.track()

describe('path-scan-task', () => {
  let task, dir

  beforeEach(function () {
    const tempDirPath = temp.mkdirSync('empty-dir')
    dir = fs.realpathSync(tempDirPath)

    fs.writeFileSync(Path.join(dir, 'note-1.txt'), '1')
    fs.writeFileSync(Path.join(dir, 'note-2.txt'), '2')
    fs.writeFileSync(Path.join(dir, 'other.zip'), '...')
    fs.writeFileSync(Path.join(dir, 'note-3.txt'), '3')

    const taskPath = Path.join(__dirname, '..', 'lib', 'path-scan-task.js')
    task = new Task(taskPath)
  })

  afterEach(function () {
    temp.cleanupSync()
    task.terminate()
  })

  describe('.start', function () {
    let addSpy

    beforeEach(function () {
      addSpy = jasmine.createSpy('add')
      task.on('add', addSpy)

      let done = false
      task.on('ready', () => {
        done = true
      })
      task.start(dir, {
        ignored: 'node_modules',
        persistent: true,
        depth: 0,
        cwd: dir
      })
      waitsFor(() => done)
    })

    it('should yield add events for each file found in dir', function () {
      expect(addSpy).toHaveBeenCalled()
      expect(addSpy.calls.length).toEqual(4)
      expect(addSpy.calls[0].args[0]).toEqual('note-1.txt')
      expect(addSpy.calls[0].args[1]).toEqual(jasmine.any(Object))
    })
  })
})
