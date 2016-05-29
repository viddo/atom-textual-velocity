'use babel'

import R from 'ramda'
import Bacon from 'baconjs'
import Logger from '../lib/logger'
import fixToEqualJasmineAny from './fix-to-equal-jasmine-any'
import fixUnbalancedConsoleGroups from './fix-unbalanced-console.groups'

fixToEqualJasmineAny()

describe('logger', () => {
  fixUnbalancedConsoleGroups()

  beforeEach(function () {
    this.consoleSpy = jasmine.createSpyObj('console', ['log', 'groupCollapsed', 'groupEnd'])
    this.logger = new Logger({env: 'logger test', console: this.consoleSpy})
    this.logger.toggle(true)
  })

  describe('.logSessionStart', function () {
    beforeEach(function () {
      this.req = {foo: 'bar'}
      this.logger.logSessionStart(this.req)
    })

    it('should log request', function () {
      expect(this.consoleSpy.log).toHaveBeenCalledWith(this.req)
    })
  })

  describe('.logPathScan', function () {
    beforeEach(function () {
      this.filesBus = new Bacon.Bus()
      this.initialScanDoneBus = new Bacon.Bus()

      const filesProp = this.filesBus.toProperty()
      const initialScanDoneProp = this.initialScanDoneBus.map(true).toProperty(false)

      this.prevCallsLength = this.consoleSpy.log.calls.length // to compensate for console logs done previously

      this.logger.logPathScan({filesProp: filesProp, initialScanDoneProp: initialScanDoneProp})
      R.times((i) => { this.filesBus.push(R.repeat(`file ${i}`, i)) }, 5)
    })

    it('should create collapsed group', function () {
      expect(this.consoleSpy.groupCollapsed).toHaveBeenCalledWith(jasmine.any(String))
    })

    it('should log individual files added while initial scan is not set', function () {
      expect(this.consoleSpy.log.calls.length - this.prevCallsLength).toEqual(5)
      expect(this.consoleSpy.log.calls[this.prevCallsLength + 1].args[0]).toEqual('file 1')
    })

    describe('when initial scan is done', function () {
      beforeEach(function () {
        this.initialScanDoneBus.push(true)
      })

      it('should not any more files', function () {
        this.filesBus.push('this one should not be logged')
        expect(this.consoleSpy.log.calls.length).toEqual(6)
        expect(R.last(this.consoleSpy.log.calls).args[0]).not.toEqual('this one should not be logged')
        expect(R.last(this.consoleSpy.log.calls).args[0]).toMatch(/\d files found/)
      })

      it('should not log any more files found', function () {
        this.initialScanDoneBus.push(false)
        this.filesBus.push(['file 1', 'file 2', 'file 3', 'new!'])
        this.initialScanDoneBus.push(true)
        this.filesBus.push(['file 1', 'file 2', 'file 3', 'new!', 'even newer!'])
        this.initialScanDoneBus.push(false)
        this.filesBus.push(['file 1', 'file 2', 'file 3', 'new!', 'even newer!', 'not this either'])
        expect(this.consoleSpy.log.calls.length).toEqual(6)
        expect(R.last(this.consoleSpy.log.calls).args[0]).toContain('4 files found')
      })
    })
  })

  describe('.logSessionEnd', function () {
    beforeEach(function () {
      this.logger.logSessionEnd()
    })

    it('should log end of session', function () {
      expect(this.consoleSpy.log).toHaveBeenCalled()
    })
  })
})
