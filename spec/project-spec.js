'use babel'

import Path from 'path'
import Bacon from 'baconjs'
import Project from '../lib/project'

const STANDARD_PATH = Path.join(__dirname, 'fixtures', 'standard')

describe('Project', () => {
  let project, r
  let resultsSpy, isLoadingFilesSpy, filesSpy, newFilePathSpy

  beforeEach(() => {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    project = new Project({
      rootPath: STANDARD_PATH,
      sortFieldProp: Bacon.constant('mtimestamp'),
      sortDirectionProp: Bacon.constant('desc'),
    })

    isLoadingFilesSpy = jasmine.createSpy('isLoading')
    resultsSpy = jasmine.createSpy('results')
    filesSpy = jasmine.createSpy('files')
    newFilePathSpy = jasmine.createSpy('newFilePathProp')

    project.isLoadingFilesProp.onValue(isLoadingFilesSpy)
    project.resultsProp.onValue(resultsSpy)
    project.filesProp.onValue(filesSpy)
    project.newFilePathProp.onValue(newFilePathSpy)
  })

  afterEach(() => {
    project.dispose()
  })

  it('is loading files right away', function () {
    expect(isLoadingFilesSpy.calls[0].args[0]).toBe(true)
  })

  it('have a project', function () {
    expect(project).toBeDefined()
  })

  it('have expected props', function () {
    expect(project.searchBus).toBeDefined()
    expect(project.filesProp).toBeDefined()
    expect(project.resultsProp).toBeDefined()
    expect(project.isLoadingFilesProp).toBeDefined()
    expect(project.newFilePathProp).toBeDefined()
  })

  it('have a default filepath', function () {
    expect(newFilePathSpy.calls[0].args[0]).toContain(STANDARD_PATH)
    expect(newFilePathSpy.calls[0].args[0]).toMatch('untitled.md$')
  })

  describe('when search string contains a file extension', function () {
    beforeEach(function () {
      project.searchBus.push('foo bar baz.js')
    })

    it('should have custom file extension', function () {
      expect(newFilePathSpy.calls[1].args[0]).toMatch('baz.js$')
    })
  })

  describe('when project is finished loading files', function () {
    beforeEach(function () {
      waitsFor(() => {
        return isLoadingFilesSpy.calls.length >= 2
      })
    })

    it('is not loading files anymore', function () {
      expect(isLoadingFilesSpy.calls[1].args[0]).toBe(false)
    })

    it('has files', function () {
      expect(filesSpy.calls[0].args[0].length).toEqual(4)
    })

    describe('when query w/o search string', () => {
      beforeEach(() => {
        project.searchBus.push('')
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('triggers results prop', () => {
        expect(r.query).toEqual('')
        expect(r.total).toEqual(4)
        expect(r.items.length).toEqual(4)
      })
    })

    describe('when query with search string', () => {
      beforeEach(() => {
        project.searchBus.push('thislineshouldonlyexistinonefile')
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('triggers results prop', () => {
        expect(r.query).toEqual('thislineshouldonlyexistinonefile')
        expect(r.total).toEqual(1)
        expect(r.items.length).toEqual(1)
        expect(r.items[0].id).toEqual(0)
      })
    })
  })
})
