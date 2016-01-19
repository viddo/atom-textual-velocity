path = require 'path'
{Task} = require 'atom'
sendMessageTo = require '../../lib/tasks/send-message-to'

describe 'PathsWatcherTask', ->
  [task, resultsSpy, r] = []

  beforeEach ->
    resultsSpy = jasmine.createSpy('results')
    task = new Task(require.resolve('../../lib/tasks/paths-watcher.js'))
    task.start([path.join(__dirname, '..', 'fixtures')], [], true)
    task.on('results', resultsSpy)

  afterEach ->
    sendMessageTo(task, 'dispose')
    task.terminate()

  describe 'when query w/o search string', ->
    beforeEach ->
      sendMessageTo(task, 'query', {
        searchStr: '',
        paginationOffset: 0,
        paginationSize: 123
      })
      waitsFor ->
        resultsSpy.calls.length >= 2
      runs ->
        r = resultsSpy.calls[1].args[0]

    it 'emits results', ->
      expect(resultsSpy).toHaveBeenCalled()
      expect(r.total).toEqual(2)
      expect(r.items.length).toEqual(2)

    it 'result items has some data', ->
      expect(r.items[0].path.length).toBeGreaterThan(0)
      expect(r.items[0].stat).toBeDefined()
      expect(r.items[0].stat.birthtime).toBeDefined()

  describe 'when query w/o search string', ->
    beforeEach ->
      sendMessageTo(task, 'query', {
        searchStr: 'thislineshouldonlyexistinonefile',
        paginationOffset: 0,
        paginationSize: 123
      })
      waitsFor ->
        resultsSpy.calls.length >= 2
      runs ->
        r = resultsSpy.calls[1].args[0]

    it 'emits results', ->
      expect(resultsSpy).toHaveBeenCalled()
      expect(r.total).toEqual(1)
      expect(r.items.length).toEqual(1)
      expect(r.items[0].path).toMatch(/an-example.txt$/)

    it 'result items has some data', ->
      expect(r.items[0].path.length).toBeGreaterThan(0)
      expect(r.items[0].stat).toBeDefined()
      expect(r.items[0].stat.birthtime).toBeDefined()
