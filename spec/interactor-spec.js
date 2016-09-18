/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import Sifter from 'sifter'
import Interactor from '../lib/interactor'
import NotesFile from '../lib/notes-file'

describe('interactor', function () {
  let buses, interactor, spies

  beforeEach(function () {
    buses = {
      abortEditCellS: new Bacon.Bus(),
      activePathS: new Bacon.Bus(),
      clickedCellS: new Bacon.Bus(),
      editCellS: new Bacon.Bus(),
      dblClickedCell: new Bacon.Bus(),
      initialScanDoneP: new Bacon.Bus(),
      keyDownS: new Bacon.Bus(),
      keyEnterS: new Bacon.Bus(),
      keyEscS: new Bacon.Bus(),
      keyUpS: new Bacon.Bus(),
      listHeightS: new Bacon.Bus(),
      rowHeightS: new Bacon.Bus(),
      saveEditedCellContentS: new Bacon.Bus(),
      scrollTopS: new Bacon.Bus(),
      sessionStartS: new Bacon.Bus(),
      sifterP: new Bacon.Bus(),
      sortDirectionS: new Bacon.Bus(),
      sortFieldS: new Bacon.Bus(),
      textInputS: new Bacon.Bus()
    }

    const viewCtrl = {
      abortEditCellS: buses.abortEditCellS,
      activePathS: buses.activePathS,
      clickedCellS: buses.clickedCellS,
      dblClickedCellS: buses.dblClickedCell,
      keyDownS: buses.keyDownS,
      keyEnterS: buses.keyEnterS,
      keyEscS: buses.keyEscS,
      keyUpS: buses.keyUpS,
      listHeightS: buses.listHeightS,
      rowHeightS: buses.rowHeightS,
      scrollTopS: buses.scrollTopS,
      saveEditedCellContentS: buses.saveEditedCellContentS,
      sessionStartS: buses.sessionStartS,
      sortDirectionS: buses.sortDirectionS,
      sortFieldS: buses.sortFieldS,
      textInputS: buses.textInputS,
      deactivate: jasmine.createSpy('viewCtrl.deactivate')
    }

    spies = {
      disposePathWatcher: jasmine.createSpy('pathWatcher.dispose'),
      filesP: jasmine.createSpy('filesP'),
      forcedScrollTopP: jasmine.createSpy('forcedScrollTopP'),
      listHeightP: jasmine.createSpy('listHeightP'),
      loadingS: jasmine.createSpy('loadingS'),
      openFileS: jasmine.createSpy('openFileS'),
      notesPathS: jasmine.createSpy('notesPathS'),
      paginationP: jasmine.createSpy('paginationP'),
      rowHeightP: jasmine.createSpy('rowHeightP'),
      selectedIndexP: jasmine.createSpy('selectedIndexP'),
      sifterResultP: jasmine.createSpy('sifterResultP')
    }

    const pathWatcher = {
      initialScanDoneP: buses.initialScanDoneP.toProperty(),
      sifterP: buses.sifterP.toProperty(new Sifter([])),
      dispose: spies.disposePathWatcher
    }

    const pathWatcherFactory = {
      watch: () => pathWatcher
    }

    const service = {
      columnsP: {},
      editCellS: buses.editCellS,
      fieldsP: Bacon.constant([
        {filePropName: 'name'},
        {filePropName: 'ext'}
      ]),
      fileReadersP: {},
      fileWritersP: {}
    }

    interactor = new Interactor(viewCtrl, pathWatcherFactory, service)

    interactor.filesP.onValue(spies.filesP)
    interactor.forcedScrollTopP.onValue(spies.forcedScrollTopP)
    interactor.listHeightP.onValue(spies.listHeightP)
    interactor.loadingS.onValue(spies.loadingS)
    interactor.openFileS.onValue(spies.openFileS)
    interactor.notesPathS.onValue(spies.notesPathS)
    interactor.paginationP.onValue(spies.paginationP)
    interactor.rowHeightP.onValue(spies.rowHeightP)
    interactor.selectedIndexP.onValue(spies.selectedIndexP)
    interactor.sifterResultP.onValue(spies.sifterResultP)

    buses.rowHeightS.push(20)
    buses.listHeightS.push(60)
  })

  describe('when start session event is triggered', function () {
    beforeEach(function () {
      buses.sessionStartS.push({
        rootPath: __dirname,
        sortField: 'name',
        sortDirection: 'desc',
        rowHeight: 20,
        listHeight: 60,
        ignoredNames: '.git, .DS_Store',
        excludeVcsIgnoredPaths: true
      })
      buses.sortFieldS.push('name')
      buses.sortDirectionS.push('desc')
    })

    it('should yield values on some streams and props', function () {
      expect(spies.forcedScrollTopP).toHaveBeenCalledWith(undefined)
      expect(spies.listHeightP).toHaveBeenCalledWith(60)
      expect(spies.loadingS).toHaveBeenCalled()
      expect(spies.notesPathS).toHaveBeenCalled()
      expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 5})
      expect(spies.rowHeightP).toHaveBeenCalledWith(20)
      expect(spies.selectedIndexP).toHaveBeenCalledWith(undefined)

      buses.sifterP.push(
        new Sifter([
          new NotesFile('file1.md', relPath => relPath)
        ]))
      expect(spies.filesP).toHaveBeenCalled()
      expect(spies.filesP.mostRecentCall.args[0]).toEqual([jasmine.any(Object)])

      expect(spies.sifterResultP).not.toHaveBeenCalled()
      expect(spies.openFileS).not.toHaveBeenCalled()
    })

    describe('when filesP scan is done', function () {
      let allFiles

      beforeEach(function () {
        allFiles = R.times(i => {
          return new NotesFile(`file ${i}.md`, str => `/notes/${str}`)
        }, 10)
        advanceClock(1000) // due to debounced sifterP
        buses.sifterP.push(new Sifter(allFiles))
        buses.initialScanDoneP.push(true)
      })

      it('should yield sifter results', function () {
        expect(spies.sifterResultP).toHaveBeenCalled()
        const res = spies.sifterResultP.calls[0].args[0]
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
        // textInputS: should present results w/ new query
        // 1st textInputS
        spies.sifterResultP.reset()
        buses.textInputS.push('fil')
        expect(spies.sifterResultP.mostRecentCall.args[0].query).toEqual('fil')
        expect(spies.paginationP.mostRecentCall.args[0]).toEqual({start: 0, limit: 5})
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(undefined, 'should reset selection')

        // clickedCellS
        spies.selectedIndexP.reset()
        buses.clickedCellS.push(3)
        expect(spies.selectedIndexP).toHaveBeenCalledWith(3)
        expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 5})

        // listHeightS
        buses.listHeightS.push(120)
        expect(spies.listHeightP).toHaveBeenCalledWith(120)
        buses.rowHeightS.push(21)
        expect(spies.rowHeightP).toHaveBeenCalledWith(21)

        // pagination by scrollTopS
        spies.sifterResultP.reset()
        spies.paginationP.reset()
        buses.scrollTopS.push(65)
        expect(spies.paginationP).toHaveBeenCalledWith({start: 3, limit: 8})
        expect(spies.sifterResultP).not.toHaveBeenCalled()

        // reset
        spies.paginationP.reset()
        spies.selectedIndexP.reset()
        spies.sifterResultP.reset()
        buses.keyEscS.push()
        expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 8})
        expect(spies.selectedIndexP).toHaveBeenCalledWith(undefined)
        expect(spies.sifterResultP).toHaveBeenCalled()

        // 2nd textInputS
        spies.sifterResultP.reset()
        buses.textInputS.push('file')
        expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 8})
        expect(spies.selectedIndexP).toHaveBeenCalledWith(undefined)

        // sort direction+field
        spies.sifterResultP.reset()
        buses.sortDirectionS.push('asc')
        buses.sortFieldS.push('content')
        expect(spies.sifterResultP.mostRecentCall.args[0].options.sort[0]).toEqual({field: 'content', direction: 'asc'}, 'should have changed sort')

        // select prev (by offset)
        spies.selectedIndexP.reset()
        buses.keyUpS.push()
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(9, 'should select last item')
        R.times(() => { buses.keyUpS.push() }, 5)
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(4, 'should stepped index back the same amount of events')
        R.times(() => { buses.keyUpS.push() }, 4)
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(0, 'should stepped index back the same amount of events')
        R.times(() => { buses.keyUpS.push() }, 3)
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(0, 'should stay on first item')

        // select next (by offset)
        buses.clickedCellS.push(undefined)  // reset selection
        spies.selectedIndexP.reset()
        buses.keyDownS.push()
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(0, 'should start at the beginning of list')
        R.times(() => { buses.keyDownS.push() }, 5)
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(5, 'should stepped index forward the same amount of events')
        R.times(() => { buses.keyDownS.push() }, 6)
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(9, 'should stop at end of list')

        // active path change
        spies.selectedIndexP.reset()
        buses.activePathS.push('/notes/file 7.md')
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(7, 'should set the index to found file')
        buses.activePathS.push('/notes/whatever')
        expect(spies.selectedIndexP.mostRecentCall.args[0]).toEqual(undefined, 'should unset index when there is no match')
      })
    })

    it('should yield an openFile event when open stream triggers', function () {
      expect(spies.openFileS).not.toHaveBeenCalled()
      buses.keyEnterS.push()
      expect(spies.openFileS).toHaveBeenCalled()
    })
  })
})
