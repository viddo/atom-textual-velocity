'use babel'

import PathWatcher from '../lib/workers/path-watcher'
import Session from '../lib/workers/session'
import Presenter from '../lib/presenter'
import DisposableValues from '../lib/disposable-values'
import Interactor from '../lib/interactor'
import mockClass from './mock-class'

describe('interactor', function () {
  beforeEach(function () {
    jasmine.useRealClock()
    const viewCtrl = {}

    this.presenter = new Presenter(viewCtrl)
    spyOn(this.presenter, 'presentLoading')
    spyOn(this.presenter, 'presentResults')

    this.disposables = new DisposableValues()

    this.PathWatcherMock = mockClass(PathWatcher)
    this.PathWatcherMock.prototype.filesProp.andReturn(this.filesProp = {})
    this.PathWatcherMock.prototype.initialScanDoneProp.andReturn(this.initialScanDoneProp = {})
    this.PathWatcherMock.prototype.dispose

    this.SessionMock = mockClass(Session)
    this.SessionMock.prototype.onInitialResults.andReturn(() => {})
    this.SessionMock.prototype.onSearchResults.andReturn(() => {})

    this.interactor = new Interactor({
      presenter: this.presenter,
      disposables: this.disposables
    }, {
      PathWatcher: this.PathWatcherMock,
      Session: this.SessionMock
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
        paginationLimit: 123,
        ignoredNames: '.git, .DS_Store',
        excludeVcsIgnoredPaths: true
      })
    })

    it('should present loading', function () {
      expect(this.presenter.presentLoading).toHaveBeenCalled()
    })

    describe('when initial path scan is done', function () {
      beforeEach(function () {
        expect(this.SessionMock.prototype.onInitialResults).toHaveBeenCalledWith(jasmine.any(Function))
        const onInitialResults = this.SessionMock.prototype.onInitialResults.calls[0].args[0]
        onInitialResults(this.res = {})
      })

      it('should present initial results', function () {
        expect(this.presenter.presentResults).toHaveBeenCalledWith(this.res)
      })
    })

    describe('.search', function () {
      beforeEach(function () {
        this.interactor.search({str: 'meh', start: 0, limit: 10})
      })

      it('should search and start from top', function () {
        expect(this.SessionMock.prototype.search).toHaveBeenCalledWith({str: 'meh', start: 0, limit: 10})
      })

      describe('when search results are available', function () {
        beforeEach(function () {
          this.presenter.presentResults.reset()
          expect(this.SessionMock.prototype.onSearchResults).toHaveBeenCalledWith(jasmine.any(Function))
          const onSearchResults = this.SessionMock.prototype.onSearchResults.calls[0].args[0]
          onSearchResults(this.res = {})
        })

        it('should present search results', function () {
          expect(this.presenter.presentResults).toHaveBeenCalledWith(this.res)
        })
      })
    })

    describe('.sortByField', function () {
      beforeEach(function () {
        this.interactor.sortByField('tags')
      })

      it('should change the field to sort by', function () {
        expect(this.SessionMock.prototype.sortByField).toHaveBeenCalledWith('tags')
      })
    })

    describe('.changeSortDirection', function () {
      beforeEach(function () {
        this.interactor.changeSortDirection()
      })

      it('should change sort direction', function () {
        expect(this.SessionMock.prototype.changeSortDirection).toHaveBeenCalled()
      })
    })
  })
})
