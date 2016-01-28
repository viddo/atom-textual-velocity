'use babel'

import Bacon from 'baconjs'
import Path from 'path'
import PathsWatcher from '../lib/paths-watcher'

describe('PathsWatcher', () => {
  let pathsWatcher, resultsSpy, r, readySpy
  let openProjectPathBus, closeProjectPathBus, paginateLastQueryBus, queryBus

  beforeEach(() => {
    openProjectPathBus = new Bacon.Bus()
    closeProjectPathBus = new Bacon.Bus()
    paginateLastQueryBus = new Bacon.Bus()
    queryBus = new Bacon.Bus()

    pathsWatcher = new PathsWatcher({
      openProjectPathStream: openProjectPathBus,
      closeProjectPathStream: closeProjectPathBus,
      paginateLastQueryStream: paginateLastQueryBus,
      queryStream: queryBus
    })

    resultsSpy = jasmine.createSpy('results')
    pathsWatcher.resultsStream.onValue(resultsSpy)
    readySpy = jasmine.createSpy('ready')
    pathsWatcher.readyStream.onValue(readySpy)

    openProjectPathBus.push({
      path: Path.join(__dirname, 'fixtures'),
      ignoredNames: [],
      excludeVcsIgnoredPaths: true
    })

    waitsFor(() => {
      return readySpy.calls.length >= 1
    })
  })

  afterEach(() => {
    pathsWatcher.dispose()
  })

  describe('when query w/o search string', () => {
    beforeEach(() => {
      queryBus.push({
        searchStr: '',
        paginationOffset: 0,
        paginationSize: 123
      })
      waitsFor(() => {
        return resultsSpy.calls.length >= 1
      })
      runs(() => {
        r = resultsSpy.calls[0].args[0]
      })
    })

    it('emits results', () => {
      expect(resultsSpy).toHaveBeenCalled()
      expect(r.total).toEqual(2)
      expect(r.items.length).toEqual(2)
    })

    it('result items has some data', () => {
      expect(r.items[0].relPath.length).toBeGreaterThan(0)
      expect(r.items[0].stat).toBeDefined()
      expect(r.items[0].stat.birthtime).toBeDefined()
    })
  })

  describe('when query w/o search string', () => {
    beforeEach(() => {
      queryBus.push({
        searchStr: 'thislineshouldonlyexistinonefile',
        paginationOffset: 0,
        paginationSize: 123
      })
      waitsFor(() => {
        return resultsSpy.calls.length >= 1
      })
      runs(() => {
        r = resultsSpy.calls[0].args[0]
      })
    })

    it('emits results', () => {
      expect(resultsSpy).toHaveBeenCalled()
      expect(r.total).toEqual(1)
      expect(r.items.length).toEqual(1)
      expect(r.items[0].relPath).toMatch(/an-example.txt$/)
    })

    it('result items has some data', () => {
      expect(r.items[0].relPath.length).toBeGreaterThan(0)
      expect(r.items[0].stat).toBeDefined()
      expect(r.items[0].stat.birthtime).toBeDefined()
    })
  })
})
