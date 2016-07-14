'use babel'

import Bacon from 'baconjs'
import R from 'ramda'
import PathWatcher from '../lib/path-watcher'
import Presenter from '../lib/presenter'
import Interactor from '../lib/interactor'
import mockClass from './mock-class'

describe('interactor', function () {
  beforeEach(function () {
    this.presenter = new Presenter({
      viewCtrl: {},
      columns: []
    })
    spyOn(this.presenter, 'presentLoading')
    spyOn(this.presenter, 'presentResults')

    this.filesBus = new Bacon.Bus()
    this.initialScanDoneBus = new Bacon.Bus()

    this.files = R.times(i => ({
      id: i,
      path: `file ${i}.txt`,
      name: `file ${i}`,
      content: `content for ${i}`,
      last_updated_at: new Date()
    }), 10)

    this.PathWatcherMock = mockClass(PathWatcher)
    this.PathWatcherMock.prototype.filesProp = this.filesBus.toProperty(this.files)
    this.PathWatcherMock.prototype.initialScanDoneProp = this.initialScanDoneBus.toProperty(false)
    this.PathWatcherMock.prototype.dispose

    this.interactor = new Interactor(this.presenter, {PathWatcher: this.PathWatcherMock})
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

    it('should not present results yet', function () {
      expect(this.presenter.presentResults).not.toHaveBeenCalled()
    })

    describe('when files scan is done', function () {
      beforeEach(function () {
        this.initialScanDoneBus.push(true)
        expect(this.presenter.presentResults).not.toHaveBeenCalled()
        window.advanceClock(5000) // debounced sifterProp
        expect(this.presenter.presentResults).toHaveBeenCalled()
      })

      // since the various states are inter-related on previous state I'll test the various scenarios after each other
      it('should present results according input', function () {
        // search: should present results w/ new query
        // 1st search
        this.interactor.search('file')
        expect(this.presenter.presentResults.mostRecentCall.args[0].files).toEqual(this.files)
        expect(this.presenter.presentResults.mostRecentCall.args[0].sifterResult).toEqual(
          jasmine.objectContaining({query: 'file'}),
          'should set sifterResult'
        )
        expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 0, limit: 123})
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should reset selection')

        // selectByIndex
        this.interactor.selectByIndex(3)
        expect(this.presenter.presentResults.mostRecentCall.args[0].files).toEqual(this.files)
        expect(this.presenter.presentResults.mostRecentCall.args[0].sifterResult).toEqual(jasmine.any(Object))
        expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 0, limit: 123})
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(3, 'should set selected index')

        // pagination
        this.interactor.paginate({start: 2, limit: 4})
        expect(this.presenter.presentResults.mostRecentCall.args[0].files).toEqual(this.files)
        expect(this.presenter.presentResults.mostRecentCall.args[0].sifterResult).toEqual(jasmine.any(Object))
        expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 2, limit: 4}, 'should update pagination')
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(3)

        // 2nd search
        this.interactor.search('file')
        expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 0, limit: 4}, 'should reset start')
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should reset any selection')

        // sortByField
        this.interactor.selectByIndex(3)
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(3, 'should set selected index')
        this.interactor.sortByField('tags')
        expect(this.presenter.presentResults.mostRecentCall.args[0].sifterResult.options.sort[0]).toEqual({field: 'tags', direction: 'desc'}, 'should change field')
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should reset selected index')

        // sortDirection
        this.interactor.selectByIndex(3)
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(3, 'should set selected index')
        this.interactor.sortDirection('asc')
        expect(this.presenter.presentResults.mostRecentCall.args[0].sifterResult.options.sort[0]).toEqual({field: 'tags', direction: 'asc'}, 'should change direction')
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should reset selected index')

        // selectPrev
        this.interactor.selectPrev()
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(9, 'should start at the end of list')
        // expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 6, limit: 4}, 'should update pagination to match selection')
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(4, 'should stepped index back the same amount of calls to selectPrev')
        // expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 4, limit: 4}, 'should update pagination to match selection')
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(0, 'should stepped index back the same amount of calls to selectPrev')
        // expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 0, limit: 4}, 'should stop start at 0')

        this.interactor.selectByIndex(undefined)
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should be reset')

        // selectNext
        this.interactor.selectNext()
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(0, 'should start at the beginning of list')
        // expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 0, limit: 4}, 'should update pagination to match selection')
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(5, 'should stepped index forward the same amount of calls to selectNext')
        // expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 1, limit: 4}, 'should update pagination to match selection')
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        expect(this.presenter.presentResults.mostRecentCall.args[0].selectedIndex).toEqual(9, 'should stop at end of list')
        // expect(this.presenter.presentResults.mostRecentCall.args[0].pagination).toEqual({start: 5, limit: 4}, 'should update pagination to match selection')
      })
    })
  })
})
