path = require 'path'
{Task} = require 'atom'
sendMessageTo = require '../lib/task/send-message-to'

describe 'PathsWatcherTask', ->
  [task, addedItemSpy] = []

  beforeEach ->
    addedItemSpy = jasmine.createSpy('addedItem')
    task = new Task(require.resolve('../lib/paths-watcher-task.js'))
    task.on('addedItem', addedItemSpy)
    task.start([path.join(__dirname, 'fixtures')], [], true)
    waitsFor ->
      addedItemSpy.calls.length >= 2

  afterEach ->
    task.terminate()

  it 'emits only text files', ->
    expect(addedItemSpy).toHaveBeenCalled()
    expect(addedItemSpy.calls[0].args[0].title).toEqual('empty.md')
    expect(addedItemSpy.calls[1].args[0].title).toEqual('empty.txt')
