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
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    jasmine.Clock.useMock()

    this.newFile = name => {
      const file = new File(name, {})
      spyOn(file, 'name').andReturn(name)
      return file
    }

    File = prepFile(__dirname)
    this.file1 = this.newFile('file1.txt')

    this.initialScanDoneBus = new Bacon.Bus()
    this.filesBus = new Bacon.Bus()
    const filesProp = this.filesBus.toProperty([])

    this.session = new Session({
      initialScanDoneProp: this.initialScanDoneBus.map(true).toProperty(false),
      filesProp: filesProp,
      sortField: 'name',
      sortDirection: 'asc'
    })
  })

  afterEach(function () {
    this.session.dispose()
  })

  describe('.onResults', function () {
    beforeEach(function () {
      this.callbackSpy = jasmine.createSpy('callback')
      this.unsub = this.session.onResults(this.callbackSpy)
      this.filesBus.push([this.file1])
    })

    afterEach(function () {
      this.unsub()
    })

    it('should return a unsubscribe function', function () {
      expect(this.unsub).toEqual(jasmine.any(Function))
    })

    it('should not have any results initially', function () {
      expect(this.callbackSpy).not.toHaveBeenCalled()
    })

    describe('when initial scan is done after setup', function () {
      beforeEach(function () {
        this.initialScanDoneBus.push(true)
      })

      it('should yield a search a results', function () {
        expect(this.callbackSpy.calls.length).toEqual(1)
        expect(this.callbackSpy.calls[0].args[0].sifterResult).toEqual(jasmine.any(Object))
      })
    })

    describe('when initial scan finished before setup but files is updated after initial debounce', function () {
      beforeEach(function () {
        this.filesBus.push([this.file1])
        this.filesBus.push([this.file1, this.newFile('file2')])
      })

      it('should yield a result but once', function () {
        expect(this.callbackSpy.calls.length).toEqual(0)
        jasmine.Clock.tick(1000)
        expect(this.callbackSpy.calls.length).toEqual(1)
      })
    })

  })
})
