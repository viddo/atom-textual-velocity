'use babel'

import Bacon from 'baconjs'
import prepFile from '../../lib/value-objects/prep-file'
import Session from '../../lib/workers/session'
import fixToEqualJasmineAny from '../fix-to-equal-jasmine-any'
import fixUnbalancedConsoleGroups from '../fix-unbalanced-console.groups'

fixToEqualJasmineAny()

describe('workers/session', () => {
  fixUnbalancedConsoleGroups()

  let File

  beforeEach(function () {
    let id = 0
    this.newFile = (name, content) => {
      const file = new File(name, {})
      file.id = id++
      spyOn(file, 'name').andReturn(name)
      spyOn(file, 'content').andReturn(content)
      return file
    }

    File = prepFile(__dirname)
    this.foobarFile = this.newFile('foobar.txt', '1st')
    this.bazFile = this.newFile('baz.txt', '2nd')
    this.quxFile = this.newFile('qux.txt', '3rd')

    this.filesBus = new Bacon.Bus()
    const filesProp = this.filesBus.toProperty([])
    this.unsubFiles = filesProp.onValue(() => {}) // fake path-watcher setup

    this.initialPathScanDoneBus = new Bacon.Bus()
    const initialPathScanDoneProp = this.initialPathScanDoneBus.map(true).toProperty(false)
    this.unsubInitialPathScanDoneProp = initialPathScanDoneProp.onValue(() => {}) // fake path-watcher setup

    this.session = new Session({
      initialPathScanDoneProp: initialPathScanDoneProp,
      filesProp: filesProp,
      paginationLimit: 42,
      sortField: 'name',
      sortDirection: 'asc'
    })

    this.filesBus.push([this.foobarFile])

    this.initialResultsSpy = jasmine.createSpy('initialResults')
    this.session.onInitialResults(this.initialResultsSpy)

    this.searchResultsSpy = jasmine.createSpy('searchResults')
    this.unsubSearchResults = this.session.onSearchResults(this.searchResultsSpy)
  })

  afterEach(function () {
    this.session.dispose()
    this.unsubInitialPathScanDoneProp()
    this.unsubFiles()
    this.unsubSearchResults()
  })

  it('should not have not results yet', function () {
    expect(this.initialResultsSpy).not.toHaveBeenCalled()
  })

  describe('when initial path scan is done', function () {
    beforeEach(function () {
      this.filesBus.push([this.foobarFile, this.bazFile])
      this.filesBus.push([this.foobarFile, this.bazFile, this.quxFile])
      this.initialPathScanDoneBus.push(true)
      window.advanceClock(2000) // debounced sifterProp
    })

    describe('should yield a result once', function () {
      beforeEach(function () {
        expect(this.initialResultsSpy).toHaveBeenCalled()
        expect(this.initialResultsSpy.calls.length).toEqual(1)
        this.res = this.initialResultsSpy.calls[0].args[0]
      })

      describe('should contain files', function () {
        beforeEach(function () {
          this.files = this.res.files
          expect(this.files).toEqual(jasmine.any(Array))
        })

        it('with all files found during path scan', function () {
          expect(this.res.files.length).toEqual(3)
          expect(this.res.files[0].relPath).toEqual('foobar.txt')
        })
      })

      describe('should contain the filter applied', function () {
        beforeEach(function () {
          this.filter = this.res.filter
          expect(this.filter).toEqual(jasmine.any(Object))
        })

        it('with start at the top', function () {
          expect(this.filter.start).toEqual(0)
        })

        it('with initial pagination limit', function () {
          expect(this.filter.limit).toEqual(42)
        })

        it('with changed str', function () {
          expect(this.filter.str).toEqual('')
          expect(this.filter.strChanged).toBe(true)
        })
      })

      describe('should contain a sifter result', function () {
        beforeEach(function () {
          this.sifterResult = this.res.sifterResult
          expect(this.sifterResult).toEqual(jasmine.any(Object))
        })

        it('with options', function () {
          expect(this.sifterResult.options).toEqual({
            fields: ['name', 'content'],
            sort: [
              { field: 'name', direction: 'asc' },
              { field: '$score', direction: 'asc' }
            ],
            conjunction: 'and'
          })
        })

        it('with some search meta', function () {
          expect(this.sifterResult).toEqual(jasmine.objectContaining({
            query: '',
            tokens: [],
            total: 3
          }))
        })

        it('with all items since there is no actual search applied', function () {
          expect(this.sifterResult.items).toEqual([
            {score: 1, id: 1}, // baz
            {score: 1, id: 0}, // foobar
            {score: 1, id: 2} // qux
          ])
        })
      })
    })

    describe('when doing a search', function () {
      beforeEach(function () {
        this.searchResultsSpy.reset()
        this.session.search({str: 'foo'})
      })

      describe('should yield a result', function () {
        beforeEach(function () {
          expect(this.searchResultsSpy).toHaveBeenCalled()
          this.res = this.searchResultsSpy.calls[0].args[0]
          expect(this.res).toBeDefined()
        })

        it('should contain all files', function () {
          expect(this.res.files).toEqual(jasmine.any(Array))
          expect(this.res.files.length).toEqual(3)
        })

        it('should contain a sifter result', function () {
          expect(this.res.sifterResult).toEqual(jasmine.objectContaining({
            query: 'foo',
            tokens: [{string: 'foo', regex: /f[oÒÓÔÕÕÖØòóôõöøŌō][oÒÓÔÕÕÖØòóôõöøŌō]/i}],
            items: [{score: jasmine.any(Number), id: 0}],
            total: 1
          }))
        })

        it('should contain the filtered item reference', function () {
          expect(this.res.sifterResult.items).toEqual([{id: 0, score: jasmine.any(Number)}]) // this.foobarFile
        })
      })

      describe('when paginate after the first search', function () {
        beforeEach(function () {
          this.searchResultsSpy.reset()
          this.session.search({start: 2, limit: 3})
        })

        describe('should yield a new result', function () {
          beforeEach(function () {
            expect(this.searchResultsSpy).toHaveBeenCalled()
            this.res = this.searchResultsSpy.calls[0].args[0]
            expect(this.res).toBeDefined()
          })

          it('should contain files', function () {
            expect(this.res.files).toEqual(jasmine.any(Array))
            expect(this.res.files.length).toEqual(3)
          })

          it('should yield same string search query', function () {
            expect(this.res.sifterResult).toEqual(jasmine.objectContaining({
              query: 'foo',
              tokens: [{string: 'foo', regex: /f[oÒÓÔÕÕÖØòóôõöøŌō][oÒÓÔÕÕÖØòóôõöøŌō]/i}],
              items: [{score: jasmine.any(Number), id: 0}],
              total: 1
            }))
          })

          describe('should have new filter', function () {
            beforeEach(function () {
              this.filter = this.res.filter
              expect(this.res.filter).toEqual(jasmine.any(Object))
            })

            it('with pagination', function () {
              expect(this.filter.start).toEqual(2)
              expect(this.filter.limit).toEqual(3)
            })

            it('with unchanged string', function () {
              expect(this.filter.str).toEqual('foo')
              expect(this.filter.strChanged).toBe(false)
            })
          })
        })
      })
    })
  })
})
