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
      sortField: 'name',
      sortDirection: 'asc'
    })

    this.filesBus.push([this.foobarFile])

    this.resultsSpy = jasmine.createSpy('results')
    this.unsubResults = this.session.onResults(this.resultsSpy)
  })

  afterEach(function () {
    this.session.dispose()
    this.unsubInitialPathScanDoneProp()
    this.unsubFiles()
    this.unsubResults()
  })

  it('should not have not results yet', function () {
    expect(this.resultsSpy).not.toHaveBeenCalled()
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
        expect(this.resultsSpy).toHaveBeenCalled()
        expect(this.resultsSpy.calls.length).toEqual(1)
        this.result = this.resultsSpy.calls[0].args[0]
      })

      describe('should contain files', function () {
        beforeEach(function () {
          this.files = this.result.files
          expect(this.files).toEqual(jasmine.any(Array))
        })

        it('with all files found during path scan', function () {
          expect(this.result.files.length).toEqual(3)
          expect(this.result.files[0].name()).toEqual('foobar.txt')
        })
      })

      describe('should contain a sifter result', function () {
        beforeEach(function () {
          this.sifterResult = this.result.sifterResult
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
        this.session.search('foo')
      })

      describe('should yield new result', function () {
        beforeEach(function () {
          expect(this.resultsSpy.calls.length).toEqual(2)
          this.sifterResult = this.resultsSpy.calls[1].args[0].sifterResult
        })

        it('should contain search meta', function () {
          expect(this.sifterResult).toEqual(jasmine.objectContaining({
            query: 'foo',
            tokens: [{string: 'foo', regex: /f[oÒÓÔÕÕÖØòóôõöøŌō][oÒÓÔÕÕÖØòóôõöøŌō]/i}],
            total: 1
          }))
        })

        it('should contain the filtered item reference', function () {
          expect(this.sifterResult.items).toEqual([{id: 0, score: jasmine.any(Number)}]) // this.foobarFile
        })
      })
    })
  })
})
