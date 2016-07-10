'use babel'

import Bacon from 'baconjs'
import PathWatcher from '../lib/workers/path-watcher'
import Session from '../lib/workers/session'
import Presenter from '../lib/presenter'
import Interactor from '../lib/interactor'
import mockClass from './mock-class'

describe('interactor', function () {
  beforeEach(function () {
    jasmine.useRealClock()
    const viewCtrl = {}

    this.presenter = new Presenter(viewCtrl)
    spyOn(this.presenter, 'presentLoading')
    spyOn(this.presenter, 'presentResults')

    this.PathWatcherMock = mockClass(PathWatcher)
    this.PathWatcherMock.prototype.filesProp.andReturn(this.filesProp = {})
    this.PathWatcherMock.prototype.initialScanDoneProp.andReturn(this.initialScanDoneProp = {})
    this.PathWatcherMock.prototype.dispose

    this.searchResultsBus = new Bacon.Bus()

    this.SessionMock = mockClass(Session)
    this.SessionMock.prototype.searchResultsProp = this.searchResultsBus.toProperty({})

    this.interactor = new Interactor(this.presenter, {
      PathWatcher: this.PathWatcherMock,
      Session: this.SessionMock
    })
  })

  afterEach(function () {
    this.interactor.stopSession()
  })

  describe('.startSession', function () {
    beforeEach(function () {
      this.interactor.startSession({
        rootPath: __dirname,
        sortField: 'name',
        sortDirection: 'desc',
        paginationLimit: 123,
        ignoredNames: '.git, .DS_Store',
        excludeVcsIgnoredPaths: true
      })
    })

    it('should present loading', function () {
      expect(this.presenter.presentLoading).toHaveBeenCalled()
    })

    describe('.search', function () {
      beforeEach(function () {
        this.res = {}
        this.interactor.search('meh')
      })

      it('should search by given string and reset start position', function () {
        expect(this.SessionMock.prototype.search).toHaveBeenCalledWith({str: 'meh', start: 0})
      })

      describe('when search results are available', function () {
        beforeEach(function () {
          this.presenter.presentResults.reset()
          this.searchResultsBus.push(this.res)
        })

        it('should present search results', function () {
          expect(this.presenter.presentResults).toHaveBeenCalledWith(this.res, undefined)
        })

        describe('.paginate', function () {
          beforeEach(function () {
            this.presenter.presentResults.reset()
            this.interactor.paginate({start: 2, limit: 10})
          })

          it('should paginate the last search results', function () {
            expect(this.SessionMock.prototype.search).toHaveBeenCalledWith({start: 2, limit: 10})
          })

          it('should not change present results until new results are available', function () {
            expect(this.presenter.presentResults).not.toHaveBeenCalled()
          })
        })

        describe('.selectByIndex', function () {
          beforeEach(function () {
            this.interactor.selectByIndex(3)
          })

          it('should present last search results and selected index', function () {
            expect(this.presenter.presentResults).toHaveBeenCalledWith(this.res, 3)
          })
        })
      })
    })

    describe('.sortByField', function () {
      beforeEach(function () {
        this.presenter.presentResults.reset()
        this.interactor.sortByField('tags')
      })

      it('should change the field to sort by', function () {
        expect(this.SessionMock.prototype.sortByField).toHaveBeenCalledWith('tags')
      })

      it('should present results and reset the selected item', function () {
        expect(this.presenter.presentResults).toHaveBeenCalledWith(jasmine.any(Object), undefined)
      })
    })

    describe('.changeSortDirection', function () {
      beforeEach(function () {
        this.presenter.presentResults.reset()
        this.interactor.changeSortDirection()
      })

      it('should change sort direction', function () {
        expect(this.SessionMock.prototype.changeSortDirection).toHaveBeenCalled()
      })

      it('should present results and reset the selected item', function () {
        expect(this.presenter.presentResults).toHaveBeenCalledWith(jasmine.any(Object), undefined)
      })
    })
  })
})
