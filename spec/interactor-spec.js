'use babel'

import Bacon from 'baconjs'
import R from 'ramda'
import Presenter from '../lib/presenter'
import Interactor from '../lib/interactor'

describe('interactor', function () {
  beforeEach(function () {
    const viewCtrl = {}
    const columns = []
    this.presenter = new Presenter(viewCtrl, columns)
    spyOn(this.presenter, 'presentLoading')
    spyOn(this.presenter, 'presentSearchResults')
    spyOn(this.presenter, 'presentSelectedFilePreview')
    spyOn(this.presenter, 'presentSelectedFileContent')
    spyOn(this.presenter, 'presentNewFile')

    this.filesBus = new Bacon.Bus()
    this.initialScanDoneBus = new Bacon.Bus()

    this.files = R.times(i => ({
      id: i,
      path: `/notes/file ${i}.txt`,
      name: `file ${i}`,
      content: `content for ${i}`,
      last_updated_at: new Date()
    }), 10)

    this.disposePathWatcherSpy = jasmine.createSpy('pathwatcher.dispose')
    const pathWatcher = {
      filesProp: this.filesBus.toProperty(this.files),
      initialScanDoneProp: this.initialScanDoneBus.toProperty(false),
      dispose: this.disposePathWatcherSpy
    }

    const pathWatcherFactory = {
      watch: () => {
        return pathWatcher
      }
    }
    this.interactor = new Interactor(this.presenter, pathWatcherFactory)
  })

  afterEach(function () {
    this.interactor.stopSession()
    expect(this.disposePathWatcherSpy).toHaveBeenCalled()
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
      expect(this.presenter.presentSearchResults).not.toHaveBeenCalled()
    })

    describe('when files scan is done', function () {
      beforeEach(function () {
        this.initialScanDoneBus.push(true)
        expect(this.presenter.presentSearchResults).not.toHaveBeenCalled()
        advanceClock(5000) // debounced sifterProp
        expect(this.presenter.presentSearchResults).toHaveBeenCalled()
      })

      // since the various states are inter-related on previous state I'll test the various scenarios after each other
      it('should present results according input', function () {
        // search: should present results w/ new query
        // 1st search
        this.interactor.search('file')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].files).toEqual(this.files)
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].sifterResult).toEqual(
          jasmine.objectContaining({query: 'file'}),
          'should set sifterResult'
        )
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].pagination).toEqual({start: 0, limit: 123})
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should reset selection')

        // selectByIndex
        this.presenter.presentSelectedFilePreview.reset()
        this.interactor.selectByIndex(3)
        expect(this.presenter.presentSelectedFilePreview).not.toHaveBeenCalled()
        advanceClock(1000) // debounced preview
        expect(this.presenter.presentSelectedFilePreview).toHaveBeenCalledWith(jasmine.any(Object))
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].files).toEqual(this.files)
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].sifterResult).toEqual(jasmine.any(Object))
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].pagination).toEqual({start: 0, limit: 123})
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(3, 'should set selected index')

        // pagination
        this.interactor.paginate({start: 2, limit: 4})
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].files).toEqual(this.files)
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].sifterResult).toEqual(jasmine.any(Object))
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].pagination).toEqual({start: 2, limit: 4}, 'should update pagination')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(3)

        // 2nd search
        this.presenter.presentSelectedFilePreview.reset()
        this.interactor.search('file')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].pagination).toEqual({start: 0, limit: 4}, 'should reset start')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should reset any selection')

        // sortByField
        this.interactor.selectByIndex(3)
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(3, 'should set selected index')
        this.interactor.sortByField('tags')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].sifterResult.options.sort[0]).toEqual({field: 'tags', direction: 'desc'}, 'should change field')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should reset selected index')

        // sortDirection
        this.interactor.selectByIndex(3)
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(3, 'should set selected index')
        this.interactor.sortDirection('asc')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].sifterResult.options.sort[0]).toEqual({field: 'tags', direction: 'asc'}, 'should change direction')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should reset selected index')

        // selectPrev
        this.presenter.presentSelectedFilePreview.reset()
        this.interactor.selectPrev()
        advanceClock(1000) // debounced preview
        expect(this.presenter.presentSelectedFilePreview).toHaveBeenCalledWith(jasmine.any(Object))
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(9, 'should start at the end of list')
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(4, 'should stepped index back the same amount of calls to selectPrev')
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        this.interactor.selectPrev()
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(0, 'should stepped index back the same amount of calls to selectPrev')

        this.interactor.selectByIndex(undefined)
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should be reset')

        // selectNext
        this.presenter.presentSelectedFilePreview.reset()
        this.interactor.selectNext()
        advanceClock(1000) // debounced preview
        expect(this.presenter.presentSelectedFilePreview).toHaveBeenCalledWith(jasmine.any(Object))
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(0, 'should start at the beginning of list')
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(5, 'should stepped index forward the same amount of calls to selectNext')
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        this.interactor.selectNext()
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(9, 'should stop at end of list')

        // openOrCreateItem (existing file)
        this.presenter.presentSearchResults.reset()
        this.presenter.presentSelectedFilePreview.reset()
        this.presenter.presentSelectedFileContent.reset()
        this.interactor.openOrCreateItem()
        expect(this.presenter.presentSelectedFileContent).toHaveBeenCalled()
        expect(this.presenter.presentSelectedFileContent.mostRecentCall.args[0]).toEqual(jasmine.any(Object), 'should present selected file')
        expect(this.presenter.presentSearchResults).not.toHaveBeenCalled()
        expect(this.presenter.presentSelectedFilePreview).not.toHaveBeenCalled()

        // selectByPath
        this.interactor.selectByPath('/notes/file 7.txt')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(7, 'should set correct index when there is a match')
        this.interactor.selectByPath('nonexisting')
        expect(this.presenter.presentSearchResults.mostRecentCall.args[0].selectedIndex).toEqual(undefined, 'should unset index if there is no match')

        // openOrCreateItem (new file w/ file ext)
        this.interactor.search('test-new-file.bash')
        this.presenter.presentSearchResults.reset()
        this.presenter.presentSelectedFilePreview.reset()
        this.presenter.presentSelectedFileContent.reset()
        this.interactor.openOrCreateItem()
        expect(this.presenter.presentNewFile).toHaveBeenCalled()
        expect(this.presenter.presentNewFile.mostRecentCall.args[0].path).toMatch(/test-new-file.bash$/, 'should present selected file w/o default ext')
        expect(this.presenter.presentSearchResults).not.toHaveBeenCalled()
        expect(this.presenter.presentSelectedFilePreview).not.toHaveBeenCalled()
        expect(this.presenter.presentSelectedFileContent).not.toHaveBeenCalled()
      })
    })
  })
})
