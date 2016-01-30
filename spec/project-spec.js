'use babel'

import Bacon from 'baconjs'
import Path from 'path'
import Project from '../lib/project'
import * as atoms from '../lib/atom-streams'

describe('Project', () => {
  const dirStandardPath = Path.join(__dirname, 'fixtures', 'standard')
  let project, resultsSpy, r, readySpy
  let openProjectPathBus, closeProjectPathBus

  beforeEach(() => {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    openProjectPathBus = new Bacon.Bus()
    closeProjectPathBus = new Bacon.Bus()
    spyOn(atoms, 'createOpenProjectStream').andReturn(openProjectPathBus)
    spyOn(atoms, 'createCloseProjectStream').andReturn(closeProjectPathBus)

    project = new Project()

    readySpy = jasmine.createSpy('ready')
    project.readyStream.onValue(readySpy)
    resultsSpy = jasmine.createSpy('results')
    project.resultsProp.onValue(resultsSpy)
  })

  afterEach(() => {
    project.dispose()
  })

  it('should have a project', function () {
    expect(project).toBeDefined()
  })

  it('should have expected props', function () {
    expect(project.readyStream).toBeDefined()
    expect(project.queryBus).toBeDefined()
    expect(project.resultsProp).toBeDefined()
  })

  it('should trigger empty results with defaults', function () {
    const r = resultsSpy.calls[0].args[0]
    expect(r.searchStr).toEqual('')
    expect(r.paginationOffset).toEqual(0)
    expect(r.total).toEqual(0)
    expect(r.items).toEqual([])
  })

  describe('when a project path with some standard files is opened', function () {
    beforeEach(function () {
      openProjectPathBus.push(dirStandardPath)

      waitsFor(() => {
        return readySpy.calls.length >= 1
      })
    })

    describe('when query w/o search string', () => {
      beforeEach(() => {
        project.queryBus.push({
          searchStr: '',
          paginationOffset: 0,
          paginationSize: 123
        })
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('triggers results prop', () => {
        expect(r.searchStr).toEqual('')
        expect(r.paginationOffset).toEqual(0)
        expect(r.total).toEqual(3)
        expect(r.items.length).toEqual(3)
      })

      it('results items have some data', () => {
        expect(r.items[0].basename).toEqual('another.txt')
        expect(r.items[0].stat).toBeDefined()
        expect(r.items[0].stat.birthtime).toBeDefined()
      })
    })

    describe('when query with search string', () => {
      beforeEach(() => {
        project.queryBus.push({
          searchStr: 'thislineshouldonlyexistinonefile',
          paginationOffset: 0,
          paginationSize: 123
        })
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('triggers results prop', () => {
        expect(r.searchStr).toEqual('thislineshouldonlyexistinonefile')
        expect(r.paginationOffset).toEqual(0)
        expect(r.total).toEqual(1)
        expect(r.regexp).toBeDefined()
        expect(r.items.length).toEqual(1)
      })

      it('results items have some data', () => {
        expect(r.items[0].basename).toEqual('an-example.txt')
        expect(r.items[0].stat).toBeDefined()
        expect(r.items[0].stat.birthtime).toBeDefined()
      })
    })

    describe('when paginating', function () {
      beforeEach(() => {
        project.queryBus.push({
          searchStr: '',
          paginationOffset: 2,
          paginationSize: 123
        })
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('indicates the total regardless of pagination state', function () {
        expect(r.total).toEqual(3)
      })

      it('returns the items from pagination', function () {
        expect(r.paginationOffset).toEqual(2)
        expect(r.items.length).toEqual(1)
        expect(r.items[0].basename).toEqual('empty.md')
      })
    })

    describe('when project path is closed', function () {
      beforeEach(function () {
        closeProjectPathBus.push(dirStandardPath)
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('removes the items', function () {
        expect(r.total).toEqual(0)
        expect(r.items).toEqual([])
      })
    })
  })
})
