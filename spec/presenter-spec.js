'use babel'

import ViewCtrl from '../lib/view-ctrl'
import Presenter from '../lib/presenter'
import fixToEqualJasmineAny from './fix-to-equal-jasmine-any'

fixToEqualJasmineAny()

describe('presenter', function () {
  beforeEach(function () {
    this.viewCtrl = new ViewCtrl()
    spyOn(this.viewCtrl, 'displayLoading')
    spyOn(this.viewCtrl, 'displayResults')

    this.presenter = new Presenter(this.viewCtrl)
  })

  describe('.presentLoading', function () {
    beforeEach(function () {
      this.presenter.presentLoading()
    })

    it('should display loading', function () {
      expect(this.viewCtrl.displayLoading).toHaveBeenCalled()
    })
  })

  describe('.presentFilteredResults', function () {
    beforeEach(function () {
      this.presenter.presentFilteredResults({
        files: [{path: () => '/'}],
        sifterResult: {}
      })
    })

    it('should display results', function () {
      expect(this.viewCtrl.displayResults).toHaveBeenCalledWith({
        columns: jasmine.any(Array),
        rows: jasmine.any(Array)
      })
    })
  })
})
