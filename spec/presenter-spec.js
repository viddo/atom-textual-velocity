'use babel'

import R from 'ramda'
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

  describe('.presentResults', function () {
    beforeEach(function () {
      this.allFiles = R.times(i => {
        return {id: i, path: `file ${i}`}
      }, 10)
    })

    describe('when called for initial results or a string search', function () {
      beforeEach(function () {
        this.presenter.presentResults({
          filter: {str: 'foobar', strChanged: true, start: 0, limit: 5},
          files: this.allFiles,
          sifterResult: {
            total: 7,
            items: this.allFiles.map((f, i) => { return {id: i} }).slice(3)
          }
        })
      })

      describe('should display results', function () {
        beforeEach(function () {
          expect(this.viewCtrl.displayResults).toHaveBeenCalled()
          this.res = this.viewCtrl.displayResults.calls[0].args[0]
        })

        it('should contain results meta', function () {
          expect(this.res.forcedScrollTop).toEqual(0)
          expect(this.res.focusSearchInput).toEqual(true)
          expect(this.res.paginationStart).toEqual(0)
          expect(this.res.itemsCount).toEqual(7)
        })

        it('should contain columns and rows', function () {
          expect(this.res.columns).toEqual(jasmine.any(Array))
          expect(this.res.rows).toEqual(jasmine.any(Array))
        })

        it('should slice rows according to filter', function () {
          expect(this.res.rows.length).toEqual(5)
          expect(this.res.rows[0].title).toEqual('file 3')
          expect(R.last(this.res.rows).title).toEqual('file 7')
        })
      })
    })

    describe('when called for pagination', function () {
      beforeEach(function () {
        this.presenter.presentResults({
          filter: {str: 'foobar', strChanged: false, start: 2, limit: 4},
          files: this.allFiles,
          sifterResult: {
            total: 7,
            items: this.allFiles.map((f, i) => { return {id: i} }).slice(3)
          }
        })
      })

      describe('should display results', function () {
        beforeEach(function () {
          expect(this.viewCtrl.displayResults).toHaveBeenCalled()
          this.res = this.viewCtrl.displayResults.calls[0].args[0]
        })

        it('should contain results meta', function () {
          expect(this.res.forcedScrollTop).toBeNaN()
          expect(this.res.focusSearchInput).toEqual(true)
          expect(this.res.paginationStart).toEqual(2)
          expect(this.res.itemsCount).toEqual(7)
        })

        it('should contain columns and rows', function () {
          expect(this.res.columns).toEqual(jasmine.any(Array))
          expect(this.res.rows).toEqual(jasmine.any(Array))
        })

        it('should slice rows according to filter', function () {
          expect(this.res.rows.length).toEqual(4)
          expect(this.res.rows[0].title).toEqual('file 5')
          expect(R.last(this.res.rows).title).toEqual('file 8')
        })
      })
    })
  })
})
