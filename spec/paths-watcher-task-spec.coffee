path = require 'path'
{Task} = require 'atom'
sendMessageTo = require '../lib/task/send-message-to'

describe 'PathsWatcherTask', ->
  [task, resultsSpy] = []

  beforeEach ->
    resultsSpy = jasmine.createSpy('results')
    task = new Task(require.resolve('../lib/paths-watcher-task.js'))
    task.start([path.join(__dirname, 'fixtures')], [], true)
    task.on('results', resultsSpy)

  afterEach ->
    task.terminate()

  describe 'when query w/o search string', ->
    beforeEach ->
      sendMessageTo(task, 'query', {
        searchStr: '',
        paginationOffset: 0,
        paginationSize: 123
      })
      waitsFor ->
        resultsSpy.calls.length >= 3

    it 'emits results', ->
      expect(resultsSpy).toHaveBeenCalled()
      r = resultsSpy.calls[2].args[0]
      expect(r.total).toEqual(2)
      expect(r.items.length).toEqual(2)

  describe 'when query w/o search string', ->
    beforeEach ->
      sendMessageTo(task, 'query', {
        searchStr: 'plaintext',
        paginationOffset: 0,
        paginationSize: 123
      })
      waitsFor ->
        resultsSpy.calls.length >= 3

    it 'emits results', ->
      expect(resultsSpy).toHaveBeenCalled()
      r = resultsSpy.calls[2].args[0]
      expect(r.total).toEqual(1)
      expect(r.items.length).toEqual(1)
      expect(r.items[0].path).toMatch(/plaintext.txt$/)
