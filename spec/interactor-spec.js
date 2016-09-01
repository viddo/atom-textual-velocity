/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import Interactor from '../lib/interactor'
import NotesFile from '../lib/notes-file'

describe('interactor', function () {
  let buses, interactor, spies

  beforeEach(function () {
    buses = {
      activePath: new Bacon.Bus(),
      clickedRow: new Bacon.Bus(),
      files: new Bacon.Bus(),
      initialScanDone: new Bacon.Bus(),
      keyDown: new Bacon.Bus(),
      keyEnter: new Bacon.Bus(),
      keyEsc: new Bacon.Bus(),
      keyUp: new Bacon.Bus(),
      listHeight: new Bacon.Bus(),
      rowHeight: new Bacon.Bus(),
      scrollTop: new Bacon.Bus(),
      sessionStart: new Bacon.Bus(),
      sortDirection: new Bacon.Bus(),
      sortField: new Bacon.Bus(),
      textInput: new Bacon.Bus()
    }

    const testViewCtrl = {
      activePathStream: buses.activePath,
      clickedRowStream: buses.clickedRow,
      keyDownStream: buses.keyDown,
      keyEnterStream: buses.keyEnter,
      keyEscStream: buses.keyEsc,
      keyUpStream: buses.keyUp,
      listHeightStream: buses.listHeight,
      rowHeightStream: buses.rowHeight,
      scrollTopStream: buses.scrollTop,
      sessionStartStream: buses.sessionStart,
      sortDirectionStream: buses.sortDirection,
      sortFieldStream: buses.sortField,
      textInputStream: buses.textInput,
      deactivate: jasmine.createSpy('viewCtrl.deactivate')
    }

    spies = {
      disposePathWatcher: jasmine.createSpy('pathWatcher.dispose'),
      filesProp: jasmine.createSpy('filesProp'),
      forcedScrollTopProp: jasmine.createSpy('forcedScrollTopProp'),
      listHeightProp: jasmine.createSpy('listHeightProp'),
      loadingStream: jasmine.createSpy('loadingStream'),
      openFileStream: jasmine.createSpy('openFileStream'),
      notesPathStream: jasmine.createSpy('notesPathStream'),
      paginationProp: jasmine.createSpy('paginationProp'),
      rowHeightProp: jasmine.createSpy('rowHeightProp'),
      selectedIndexProp: jasmine.createSpy('selectedIndexProp'),
      sifterResultProp: jasmine.createSpy('sifterResultProp')
    }

    const testPatchWatcher = {
      initialScanDoneProp: buses.initialScanDone.toProperty(),
      filesProp: buses.files.toProperty([]),
      dispose: spies.disposePathWatcher
    }

    const pathWatcherFactory = {
      watch: () => testPatchWatcher
    }

    interactor = new Interactor(testViewCtrl, pathWatcherFactory)

    interactor.filesProp.onValue(spies.filesProp)
    interactor.forcedScrollTopProp.onValue(spies.forcedScrollTopProp)
    interactor.listHeightProp.onValue(spies.listHeightProp)
    interactor.loadingStream.onValue(spies.loadingStream)
    interactor.openFileStream.onValue(spies.openFileStream)
    interactor.notesPathStream.onValue(spies.notesPathStream)
    interactor.paginationProp.onValue(spies.paginationProp)
    interactor.rowHeightProp.onValue(spies.rowHeightProp)
    interactor.selectedIndexProp.onValue(spies.selectedIndexProp)
    interactor.sifterResultProp.onValue(spies.sifterResultProp)

    buses.listHeight.push(60)
    buses.rowHeight.push(20)
  })

  describe('when start session event is triggered', function () {
    beforeEach(function () {
      buses.sessionStart.push({
        rootPath: __dirname,
        sortField: 'name',
        sortDirection: 'desc',
        rowHeight: 20,
        listHeight: 60,
        ignoredNames: '.git, .DS_Store',
        excludeVcsIgnoredPaths: true
      })
      buses.sortField.push('name')
      buses.sortDirection.push('desc')
    })

    it('should yield values on some streams and props', function () {
      expect(spies.forcedScrollTopProp).toHaveBeenCalledWith(undefined)
      expect(spies.listHeightProp).toHaveBeenCalledWith(60)
      expect(spies.loadingStream).toHaveBeenCalled()
      expect(spies.notesPathStream).toHaveBeenCalled()
      expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 5})
      expect(spies.rowHeightProp).toHaveBeenCalledWith(20)
      expect(spies.selectedIndexProp).toHaveBeenCalledWith(undefined)

      buses.files.push([
        new NotesFile(str => str, 'file1.md', {
          content: 'content of file 1',
          stats: null
        })
      ])
      expect(spies.filesProp).toHaveBeenCalled()
      expect(spies.filesProp.mostRecentCall.args[0]).toEqual([jasmine.any(Object)])

      expect(spies.sifterResultProp).not.toHaveBeenCalled()
      expect(spies.openFileStream).not.toHaveBeenCalled()
    })

    describe('when files scan is done', function () {
      let allFiles

      beforeEach(function () {
        allFiles = R.times(i => {
          return new NotesFile(str => `/notes/${str}`, `file ${i}.md`, {
            content: `content of file ${i}`,
            stats: null
          })
        }, 10)
        buses.files.push(allFiles)
        buses.initialScanDone.push(true)
        expect(spies.sifterResultProp).not.toHaveBeenCalled()
        advanceClock(5000) // debounced sifterProp
      })

      it('should yield sifter results', function () {
        expect(spies.sifterResultProp).toHaveBeenCalled()
        const res = spies.sifterResultProp.calls[0].args[0]
        expect(res.options).toEqual({
          fields: ['name', 'content'],
          sort: [
            {field: 'name', direction: 'desc'},
            {field: '$score', direction: 'desc'}
          ],
          conjunction: 'and'
        })
        expect(res.query).toEqual('')
        expect(res.tokens).toEqual([])
        expect(res.total).toEqual(10)
        expect(res.items).toEqual(jasmine.any(Array))
        expect(res.items[0]).toEqual({score: 1, id: jasmine.any(Number)})
      })

      // since the various states are inter-related on previous state I'll test the various scenarios after each other
      it('should yield new values on streams and props changes', function () {
        // textInput: should present results w/ new query
        // 1st textInput
        spies.sifterResultProp.reset()
        buses.textInput.push('fil')
        expect(spies.sifterResultProp.mostRecentCall.args[0].query).toEqual('fil')
        expect(spies.paginationProp.mostRecentCall.args[0]).toEqual({start: 0, limit: 5})
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(undefined, 'should reset selection')

        // clickedRow
        spies.selectedIndexProp.reset()
        buses.clickedRow.push(3)
        expect(spies.selectedIndexProp).toHaveBeenCalledWith(3)
        expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 5})

        // listHeight
        buses.listHeight.push(120)
        expect(spies.listHeightProp).toHaveBeenCalledWith(120)
        buses.rowHeight.push(21)
        expect(spies.rowHeightProp).toHaveBeenCalledWith(21)

        // pagination by scrollTop
        spies.sifterResultProp.reset()
        spies.paginationProp.reset()
        buses.scrollTop.push(65)
        expect(spies.paginationProp).toHaveBeenCalledWith({start: 3, limit: 7})
        expect(spies.sifterResultProp).not.toHaveBeenCalled()

        // reset
        spies.paginationProp.reset()
        spies.selectedIndexProp.reset()
        spies.sifterResultProp.reset()
        buses.keyEsc.push()
        expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 7})
        expect(spies.selectedIndexProp).toHaveBeenCalledWith(undefined)
        expect(spies.sifterResultProp).toHaveBeenCalled()

        // 2nd textInput
        spies.sifterResultProp.reset()
        buses.textInput.push('file')
        expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 7})
        expect(spies.selectedIndexProp).toHaveBeenCalledWith(undefined)

        // sort direction+field
        spies.sifterResultProp.reset()
        buses.sortDirection.push('asc')
        buses.sortField.push('content')
        expect(spies.sifterResultProp.mostRecentCall.args[0].options.sort[0]).toEqual({field: 'content', direction: 'asc'}, 'should have changed sort')

        // select prev (by offset)
        spies.selectedIndexProp.reset()
        buses.keyUp.push()
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(9, 'should select last item')
        R.times(() => { buses.keyUp.push() }, 5)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(4, 'should stepped index back the same amount of events')
        R.times(() => { buses.keyUp.push() }, 4)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(0, 'should stepped index back the same amount of events')
        R.times(() => { buses.keyUp.push() }, 3)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(0, 'should stay on first item')

        // select next (by offset)
        buses.clickedRow.push(undefined)  // reset selection
        spies.selectedIndexProp.reset()
        buses.keyDown.push()
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(0, 'should start at the beginning of list')
        R.times(() => { buses.keyDown.push() }, 5)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(5, 'should stepped index forward the same amount of events')
        R.times(() => { buses.keyDown.push() }, 6)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(9, 'should stop at end of list')

        // active path change
        spies.selectedIndexProp.reset()
        buses.activePath.push('/notes/file 7.md')
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(7, 'should set the index to found file')
        buses.activePath.push('/notes/whatever')
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(undefined, 'should unset index when there is no match')
      })
    })

    it('should yield an openFile event when open stream triggers', function () {
      expect(spies.openFileStream).not.toHaveBeenCalled()
      buses.keyEnter.push()
      expect(spies.openFileStream).toHaveBeenCalled()
    })
  })
})
