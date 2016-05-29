'use babel'

import Presenter from '../lib/presenter'
import Logger from '../lib/logger'
import DisposableValues from '../lib/disposable-values'
import Interactor from '../lib/interactor'
import fixToEqualJasmineAny from './fix-to-equal-jasmine-any'

fixToEqualJasmineAny()

describe('interactor', function () {
  beforeEach(function () {
    const viewCtrl = {}

    this.presenter = new Presenter(viewCtrl)
    spyOn(this.presenter, 'presentLoading')
    spyOn(this.presenter, 'presentFilteredResults')

    this.logger = new Logger({env: 'interactor test'})
    spyOn(this.logger, 'logSessionStart')
    spyOn(this.logger, 'logPathScan')
    spyOn(this.logger, 'logSessionEnd')

    this.disposables = new DisposableValues()

    this.interactor = new Interactor({
      presenter: this.presenter,
      logger: this.logger,
      disposables: this.disposables
    })
  })

  afterEach(function () {
    this.interactor.stopSession()
    this.disposables.dispose()
  })

  describe('.startSession', function () {
    beforeEach(function () {
      this.interactor.startSession({
        rootPath: __dirname,
        sortField: 'name',
        sortDirection: 'desc',
        ignoredNames: '.git, .DS_Store',
        excludeVcsIgnoredPaths: true
      })
    })

    it('should present loading', function () {
      expect(this.presenter.presentLoading).toHaveBeenCalled()
    })

    it('should log session started', function () {
      expect(this.logger.logSessionStart).toHaveBeenCalledWith(jasmine.any(Object))
    })

    it('should log path scan', function () {
      expect(this.logger.logPathScan).toHaveBeenCalledWith({
        filesProp: jasmine.any(Object),
        initialScanDoneProp: jasmine.any(Object)
      })
    })

    describe('when files scan is done', function () {
      beforeEach(function () {
        waitsFor(() => {
          return this.presenter.presentFilteredResults.calls.length >= 1
        })
        runs(() => {
          this.arg = this.presenter.presentFilteredResults.calls[0].args[0]
        })
      })

      it('should present initial results', function () {
        expect(this.presenter.presentFilteredResults).toHaveBeenCalledWith({
          files: jasmine.any(Array),
          sifterResult: jasmine.any(Object)
        })
      })
    })
  })
})
