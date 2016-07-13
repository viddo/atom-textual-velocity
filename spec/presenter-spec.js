'use babel'

import R from 'ramda'
import ViewCtrl from '../lib/view-ctrl'
import Presenter from '../lib/presenter'
import Summary from '../lib/columns/summary'

describe('presenter', function () {
  beforeEach(function () {
    this.viewCtrl = new ViewCtrl()
    spyOn(this.viewCtrl, 'displayLoading')
    spyOn(this.viewCtrl, 'displayResults')

    this.presenter = new Presenter({
      viewCtrl: this.viewCtrl,
      columns: [new Summary()]
    })
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
      this.allFiles = R.times(i => ({
        id: `f${i}`,
        index: i,
        path: `file ${i}`,
        content: `content for ${i}`
      }), 10)
    })

    describe('when called for a search and selected index', function () {
      beforeEach(function () {
        this.presenter.presentResults({
          files: this.allFiles,
          sifterResults: {
            options: {
              sort: [
                {field: 'name', direction: 'desc'},
                {field: '$core', direction: 'desc'}
              ]
            },
            query: 'str',
            total: 7,
            items: this.allFiles
              .map((f, i) => ({id: i}))
              .slice(3)
          },
          pagination: {start: 0, limit: 5},
          selectedIndex: 3
        })
      })

      describe('should display results', function () {
        beforeEach(function () {
          expect(this.viewCtrl.displayResults).toHaveBeenCalled()
          this.res = this.viewCtrl.displayResults.calls[0].args[0]
        })

        it('should contain results meta', function () {
          expect(this.res.searchStr).toEqual('str')
          expect(this.res.paginationStart).toEqual(0)
          expect(this.res.itemsCount).toEqual(7)
          expect(this.res.sort).toEqual({field: 'name', direction: 'desc'})
        })

        it('should contain columns and rows', function () {
          expect(this.res.columns).toEqual(jasmine.any(Array))
          expect(this.res.rows).toEqual(jasmine.any(Array))
        })

        it('should mark the row at the selected index as selected', function () {
          expect(this.res.rows[3].selected).toBe(true)
          expect(this.res.rows.filter(r => r.selected).length).toEqual(1, 'should only be one selected row')
        })

        it('should slice rows according to pagination', function () {
          expect(this.res.rows.length).toEqual(5)
          expect(R.head(this.res.rows).id).toEqual('f3')
          expect(R.last(this.res.rows).id).toEqual('f7')
        })

        it('should contain cells', function () {
          expect(R.head(this.res.rows).cells).toBeDefined()
        })
      })
    })

    describe('when called for pagination', function () {
      beforeEach(function () {
        this.presenter.presentResults({
          files: this.allFiles,
          sifterResults: {
            options: {
              sort: [
                {field: 'name', direction: 'desc'},
                {field: '$core', direction: 'desc'}
              ]
            },
            query: 'foobar',
            total: 7,
            items: this.allFiles.map((f, i) => { return {id: i} }).slice(3)
          },
          pagination: {start: 2, limit: 4},
          selectedIndex: undefined
        })
      })

      describe('should display results', function () {
        beforeEach(function () {
          expect(this.viewCtrl.displayResults).toHaveBeenCalled()
          this.res = this.viewCtrl.displayResults.calls[0].args[0]
        })

        it('should contain results meta', function () {
          expect(this.res.searchStr).toEqual('foobar')
          expect(this.res.paginationStart).toEqual(2)
          expect(this.res.itemsCount).toEqual(7)
          expect(this.res.sort).toEqual({field: 'name', direction: 'desc'})
        })

        it('should contain columns and rows', function () {
          expect(this.res.columns).toEqual(jasmine.any(Array))
          expect(this.res.rows).toEqual(jasmine.any(Array))
        })

        it('should slice rows according to pagination', function () {
          expect(this.res.rows.length).toEqual(4)
          expect(R.head(this.res.rows).id).toEqual('f5')
          expect(R.last(this.res.rows).id).toEqual('f8')
        })
      })
    })
  })
})
