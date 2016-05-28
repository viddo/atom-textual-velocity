'use babel'

import Presenter from '../lib/presenter'
import Interactor from '../lib/interactor'
import fixToEqualJasmineAny from './fix-to-equal-jasmine-any'
import fixUnbalancedConsoleGroups from './fix-unbalanced-console.groups'

fixToEqualJasmineAny()

describe('interactor', function () {
  fixUnbalancedConsoleGroups()

  beforeEach(function () {
    const viewCtrl = {}

    this.presenter = new Presenter(viewCtrl)
    spyOn(this.presenter, 'presentLoading')
    spyOn(this.presenter, 'presentFilesPreview')

    this.interactor = new Interactor(this.presenter)
  })

  afterEach(function () {
    this.interactor.stopSession()
  })

  describe('.startSession', function () {
    beforeEach(function () {
      this.interactor.startSession({rootPath: __dirname, contextDesc: jasmine.getEnv().currentSpec.description})
    })

    it('should present loading', function () {
      expect(this.presenter.presentLoading).toHaveBeenCalled()
    })

    describe('when files scan is done', function () {
      beforeEach(function () {
        waitsFor(() => {
          return this.presenter.presentFilesPreview.calls.length >= 1
        })
      })

      it('should present preview of raw files', function () {
        expect(this.presenter.presentFilesPreview).toHaveBeenCalledWith(jasmine.any(Array))

        const files = this.presenter.presentFilesPreview.calls[0].args[0]
        expect(files.length).toBeGreaterThan(0)
        expect(files[0].path()).toMatch(/.js$/)
      })
    })
  })
})
