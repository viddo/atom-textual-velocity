'use babel'

import Path from 'path'
import Project from '../lib/project'

const STANDARD_PATH = Path.join(__dirname, 'fixtures', 'standard')

describe('Project', () => {
  let project, r
  let resultsSpy, isLoadingFilesSpy, filesSpy

  beforeEach(() => {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    project = new Project(STANDARD_PATH)

    isLoadingFilesSpy = jasmine.createSpy('isLoading')
    resultsSpy = jasmine.createSpy('results')
    filesSpy = jasmine.createSpy('files')
    project.isLoadingFilesProp.onValue(isLoadingFilesSpy)
    project.resultsProp.onValue(resultsSpy)
    project.filesProp.onValue(filesSpy)
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
    const newFilePathSpy = jasmine.createSpy('newFilePathProp')
    project.newFilePathProp.onValue(newFilePathSpy)
    expect(newFilePathSpy.calls[0].args[0]).toContain(STANDARD_PATH)
    expect(newFilePathSpy.calls[0].args[0]).toMatch('untitled.md$')
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

    if (process.platform === 'darwin') {
      it('a file might has tags', function () {
        expect(filesSpy.calls[0].args[0][0].tags).toEqual('')

        // fixtures/standard/osx-xattr-metadata-stuff.txt
        expect(filesSpy.calls[0].args[0][3].tags).toEqual('someday mind projects')
      })

      describe('when search w/ tag', function () {
        beforeEach(() => {
          project.searchBus.push('mind')
          waitsFor(() => {
            return resultsSpy.calls.length >= 2
          })
          runs(() => {
            r = resultsSpy.calls[1].args[0]
          })
        })

        it('triggers results prop', () => {
          expect(r.query).toEqual('mind')
          expect(r.total).toEqual(1)
          expect(r.items.length).toEqual(1)
          expect(r.items[0].id).toEqual(3)
        })
      })
    }

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
