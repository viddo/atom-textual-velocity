/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import Interactor from '../lib/interactor'
import FileField from '../lib/fields/file-field'
import NotesFile from '../lib/notes-file'

describe('interactor', function () {
  let buses, interactor, spies, nameField, extField

  beforeEach(function () {
    buses = {
      abortEditCellStream: new Bacon.Bus(),
      activePathStream: new Bacon.Bus(),
      clickedCellStream: new Bacon.Bus(),
      editCellStream: new Bacon.Bus(),
      dblClickedCell: new Bacon.Bus(),
      filesProp: new Bacon.Bus(),
      initialScanDoneProp: new Bacon.Bus(),
      keyDownStream: new Bacon.Bus(),
      keyEnterStream: new Bacon.Bus(),
      keyEscStream: new Bacon.Bus(),
      keyUpStream: new Bacon.Bus(),
      listHeightStream: new Bacon.Bus(),
      rowHeightStream: new Bacon.Bus(),
      saveEditedCellContentStream: new Bacon.Bus(),
      scrollTopStream: new Bacon.Bus(),
      sessionStartStream: new Bacon.Bus(),
      sortDirectionStream: new Bacon.Bus(),
      sortFieldStream: new Bacon.Bus(),
      textInputStream: new Bacon.Bus()
    }

    const viewCtrl = {
      abortEditCellStream: buses.abortEditCellStream,
      activePathStream: buses.activePathStream,
      clickedCellStream: buses.clickedCellStream,
      dblClickedCellStream: buses.dblClickedCell,
      keyDownStream: buses.keyDownStream,
      keyEnterStream: buses.keyEnterStream,
      keyEscStream: buses.keyEscStream,
      keyUpStream: buses.keyUpStream,
      listHeightStream: buses.listHeightStream,
      rowHeightStream: buses.rowHeightStream,
      scrollTopStream: buses.scrollTopStream,
      saveEditedCellContentStream: buses.saveEditedCellContentStream,
      sessionStartStream: buses.sessionStartStream,
      sortDirectionStream: buses.sortDirectionStream,
      sortFieldStream: buses.sortFieldStream,
      textInputStream: buses.textInputStream,
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

    const pathWatcher = {
      initialScanDoneProp: buses.initialScanDoneProp.toProperty(),
      filesProp: buses.filesProp.toProperty([]),
      dispose: spies.disposePathWatcher
    }

    const pathWatcherFactory = {
      watch: () => pathWatcher
    }

    nameField = new FileField({name: 'name', propPath: 'name'})
    extField = new FileField({name: 'ext', propPath: 'ext'})
    const service = {
      columnsProp: {},
      editCellStream: buses.editCellStream,
      fieldsProp: Bacon.constant([nameField, extField]),
      fileReadersProp: {},
      fileWritersProp: {}
    }

    interactor = new Interactor(viewCtrl, pathWatcherFactory, service)

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

    buses.rowHeightStream.push(20)
    buses.listHeightStream.push(60)
  })

  describe('when start session event is triggered', function () {
    beforeEach(function () {
      buses.sessionStartStream.push({
        rootPath: __dirname,
        sortField: 'name',
        sortDirection: 'desc',
        rowHeight: 20,
        listHeight: 60,
        ignoredNames: '.git, .DS_Store',
        excludeVcsIgnoredPaths: true
      })
      buses.sortFieldStream.push('name')
      buses.sortDirectionStream.push('desc')
    })

    it('should yield values on some streams and props', function () {
      expect(spies.forcedScrollTopProp).toHaveBeenCalledWith(undefined)
      expect(spies.listHeightProp).toHaveBeenCalledWith(60)
      expect(spies.loadingStream).toHaveBeenCalled()
      expect(spies.notesPathStream).toHaveBeenCalled()
      expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 5})
      expect(spies.rowHeightProp).toHaveBeenCalledWith(20)
      expect(spies.selectedIndexProp).toHaveBeenCalledWith(undefined)

      buses.filesProp.push([
        new NotesFile('file1.md', relPath => relPath)
        // {
        //   content: 'content of file 1',
        //   stats: null
        // }
      ])
      expect(spies.filesProp).toHaveBeenCalled()
      expect(spies.filesProp.mostRecentCall.args[0]).toEqual([jasmine.any(Object)])

      expect(spies.sifterResultProp).not.toHaveBeenCalled()
      expect(spies.openFileStream).not.toHaveBeenCalled()
    })

    describe('when filesProp scan is done', function () {
      let allFiles

      beforeEach(function () {
        allFiles = R.times(i => {
          return new NotesFile(`file ${i}.md`, str => `/notes/${str}`)
          // {
          //   content: `content of file ${i}`,
          //   stats: null
          // })
        }, 10)
        buses.filesProp.push(allFiles)
        buses.initialScanDoneProp.push(true)
        expect(spies.sifterResultProp).not.toHaveBeenCalled()
        advanceClock(5000) // debounced sifterProp
      })

      it('should yield sifter results', function () {
        expect(spies.sifterResultProp).toHaveBeenCalled()
        const res = spies.sifterResultProp.calls[0].args[0]
        expect(res.options).toEqual({
          fields: ['name', 'ext'],
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
        // textInputStream: should present results w/ new query
        // 1st textInputStream
        spies.sifterResultProp.reset()
        buses.textInputStream.push('fil')
        expect(spies.sifterResultProp.mostRecentCall.args[0].query).toEqual('fil')
        expect(spies.paginationProp.mostRecentCall.args[0]).toEqual({start: 0, limit: 5})
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(undefined, 'should reset selection')

        // clickedCellStream
        spies.selectedIndexProp.reset()
        buses.clickedCellStream.push(3)
        expect(spies.selectedIndexProp).toHaveBeenCalledWith(3)
        expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 5})

        // listHeightStream
        buses.listHeightStream.push(120)
        expect(spies.listHeightProp).toHaveBeenCalledWith(120)
        buses.rowHeightStream.push(21)
        expect(spies.rowHeightProp).toHaveBeenCalledWith(21)

        // pagination by scrollTopStream
        spies.sifterResultProp.reset()
        spies.paginationProp.reset()
        buses.scrollTopStream.push(65)
        expect(spies.paginationProp).toHaveBeenCalledWith({start: 3, limit: 8})
        expect(spies.sifterResultProp).not.toHaveBeenCalled()

        // reset
        spies.paginationProp.reset()
        spies.selectedIndexProp.reset()
        spies.sifterResultProp.reset()
        buses.keyEscStream.push()
        expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 8})
        expect(spies.selectedIndexProp).toHaveBeenCalledWith(undefined)
        expect(spies.sifterResultProp).toHaveBeenCalled()

        // 2nd textInputStream
        spies.sifterResultProp.reset()
        buses.textInputStream.push('file')
        expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 8})
        expect(spies.selectedIndexProp).toHaveBeenCalledWith(undefined)

        // sort direction+field
        spies.sifterResultProp.reset()
        buses.sortDirectionStream.push('asc')
        buses.sortFieldStream.push('content')
        expect(spies.sifterResultProp.mostRecentCall.args[0].options.sort[0]).toEqual({field: 'content', direction: 'asc'}, 'should have changed sort')

        // select prev (by offset)
        spies.selectedIndexProp.reset()
        buses.keyUpStream.push()
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(9, 'should select last item')
        R.times(() => { buses.keyUpStream.push() }, 5)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(4, 'should stepped index back the same amount of events')
        R.times(() => { buses.keyUpStream.push() }, 4)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(0, 'should stepped index back the same amount of events')
        R.times(() => { buses.keyUpStream.push() }, 3)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(0, 'should stay on first item')

        // select next (by offset)
        buses.clickedCellStream.push(undefined)  // reset selection
        spies.selectedIndexProp.reset()
        buses.keyDownStream.push()
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(0, 'should start at the beginning of list')
        R.times(() => { buses.keyDownStream.push() }, 5)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(5, 'should stepped index forward the same amount of events')
        R.times(() => { buses.keyDownStream.push() }, 6)
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(9, 'should stop at end of list')

        // active path change
        spies.selectedIndexProp.reset()
        buses.activePathStream.push('/notes/file 7.md')
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(7, 'should set the index to found file')
        buses.activePathStream.push('/notes/whatever')
        expect(spies.selectedIndexProp.mostRecentCall.args[0]).toEqual(undefined, 'should unset index when there is no match')
      })
    })

    it('should yield an openFile event when open stream triggers', function () {
      expect(spies.openFileStream).not.toHaveBeenCalled()
      buses.keyEnterStream.push()
      expect(spies.openFileStream).toHaveBeenCalled()
    })
  })
})
