'use babel'

import {Task} from 'atom'
import fs from 'fs'
import Path from 'path'
import temp from 'temp'

temp.track()

describe('path-scan-task', () => {
  let task, dir, addSpy

  beforeEach(function () {
    const tempDirPath = temp.mkdirSync('empty-dir')
    dir = fs.realpathSync(tempDirPath)

    fs.writeFileSync(Path.join(dir, 'note-1.txt'), '1')
    fs.writeFileSync(Path.join(dir, 'note-2.txt'), '2')
    fs.writeFileSync(Path.join(dir, 'other.zip'), '...')
    fs.writeFileSync(Path.join(dir, 'note-3.txt'), '3')

    const taskPath = Path.join(__dirname, '..', 'lib', 'path-scan-task.js')
    task = new Task(taskPath)
    task.on('task:completed', () => {
      task.terminate()
    })

    addSpy = jasmine.createSpy('add')
    task.on('add', addSpy)

    let done = false
    task.on('done', () => {
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

  afterEach(function () {
    temp.cleanupSync()
    task.terminate()
  })

  it('should yield add events for each file found in dir', function () {
    expect(addSpy).toHaveBeenCalled()
    expect(addSpy.calls.length).toEqual(4)
    expect(addSpy.calls[0].args[0].filename).toEqual(jasmine.any(String))
    expect(addSpy.calls[0].args[0].stats).toEqual(jasmine.any(Object))
  })
})
