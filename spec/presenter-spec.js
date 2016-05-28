'use babel'

import ViewCtrl from '../lib/view-ctrl'
import Presenter from '../lib/presenter'
import fixToEqualJasmineAny from './fix-to-equal-jasmine-any'

fixToEqualJasmineAny()

describe('presenter', function () {
  beforeEach(function () {
    this.viewCtrl = new ViewCtrl()
    spyOn(this.viewCtrl, 'displayLoading')
    spyOn(this.viewCtrl, 'previewFiles')

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

  describe('.presentFilesPreview', function () {
    beforeEach(function () {
      this.presenter.presentFilesPreview([{path: () => 'path/to/file.txt'}])
    })

    it('should preview files', function () {
      expect(this.viewCtrl.previewFiles).toHaveBeenCalledWith(['path/to/file.txt'])
    })
  })
})
