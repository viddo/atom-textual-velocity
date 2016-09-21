/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import Sifter from 'sifter'
import Interactor from '../lib/interactor'

describe('interactor', function () {
  let buses, interactor, spies

  beforeEach(function () {
    buses = {
      abortEditCellS: new Bacon.Bus(),
      activePathS: new Bacon.Bus(),
      clickedCellS: new Bacon.Bus(),
      dblClickedCell: new Bacon.Bus(),
      editCellS: new Bacon.Bus(),
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
      saveEditedCellContentS: buses.saveEditedCellContentS,
      scrollTopS: buses.scrollTopS,
      sessionStartS: buses.sessionStartS,
      sortDirectionS: buses.sortDirectionS,
      sortFieldS: buses.sortFieldS,
      textInputS: buses.textInputS,
      deactivate: jasmine.createSpy('viewCtrl.deactivate')
    }

    spies = {
      disposePathWatcher: jasmine.createSpy('pathWatcher.dispose'),
      forcedScrollTopP: jasmine.createSpy('forcedScrollTopP'),
      listHeightP: jasmine.createSpy('listHeightP'),
      loadingS: jasmine.createSpy('loadingS'),
      notesP: jasmine.createSpy('notesP'),
      notesPathP: jasmine.createSpy('notesPathP'),
      openFileS: jasmine.createSpy('openFileS'),
      paginationP: jasmine.createSpy('paginationP'),
      rowHeightP: jasmine.createSpy('rowHeightP'),
      selectedRelPathS: jasmine.createSpy('selectedRelPathS'),
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
        {notePropName: 'name'},
        {notePropName: 'ext'}
      ]),
      fileReadersP: {},
      fileWritersP: {}
    }

    interactor = new Interactor(viewCtrl, pathWatcherFactory, service)

    interactor.forcedScrollTopP.onValue(spies.forcedScrollTopP)
    interactor.listHeightP.onValue(spies.listHeightP)
    interactor.loadingS.onValue(spies.loadingS)
    interactor.notesP.onValue(spies.notesP)
    interactor.notesPathP.onValue(spies.notesPathP)
    interactor.openFileS.onValue(spies.openFileS)
    interactor.paginationP.onValue(spies.paginationP)
    interactor.rowHeightP.onValue(spies.rowHeightP)
    interactor.selectedRelPathS.onValue(spies.selectedRelPathS)
    interactor.sifterResultP.onValue(spies.sifterResultP)

    buses.rowHeightS.push(20)
    buses.listHeightS.push(60)
  })

  describe('when start session event is triggered', function () {
    let notes: any

    beforeEach(function () {
      buses.sessionStartS.push({
        rootPath: '/notes',
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
      expect(spies.notesPathP).toHaveBeenCalled()
      expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 5})
      expect(spies.rowHeightP).toHaveBeenCalledWith(20)
      expect(spies.selectedRelPathS).not.toHaveBeenCalled()

      notes = {
        'note1.md': {
          id: 'id-1',
          name: 'note1',
          ext: '.md'
        }
      }
      buses.sifterP.push(new Sifter(notes))
      expect(spies.notesP).toHaveBeenCalled()
      expect(spies.notesP.mostRecentCall.args[0]).toEqual(jasmine.any(Object))

      expect(spies.sifterResultP).not.toHaveBeenCalled()
      expect(spies.openFileS).not.toHaveBeenCalled()
    })

    describe('when notesP scan is done', function () {
      beforeEach(function () {
        notes = {}
        R.times(i => {
          notes[`note ${i}.md`] = {id: `id-${i}`, name: `note ${i}`, ext: '.md'}
        }, 10)
        buses.sifterP.push(new Sifter(notes))
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
        expect(res.items[0]).toEqual({score: 1, id: jasmine.any(String)})
      })

      // since the various states are inter-related on previous state I'll test the various scenarios after each other
      it('should yield new values on streams and props changes', function () {
        // textInputS: should present results w/ new query
        // 1st textInputS
        spies.sifterResultP.reset()
        buses.textInputS.push('not')
        expect(spies.sifterResultP.mostRecentCall.args[0].query).toEqual('not')
        expect(spies.paginationP.mostRecentCall.args[0]).toEqual({start: 0, limit: 5})

        // clickedCellS
        buses.clickedCellS.push('note 6.md')
        expect(spies.selectedRelPathS).toHaveBeenCalledWith('note 6.md')
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
        spies.selectedRelPathS.reset()
        spies.sifterResultP.reset()
        buses.keyEscS.push()
        expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 8})
        expect(spies.selectedRelPathS).toHaveBeenCalledWith(undefined)
        expect(spies.sifterResultP).toHaveBeenCalled()

        // 2nd textInputS
        spies.sifterResultP.reset()
        buses.textInputS.push('note')
        expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 8})
        expect(spies.selectedRelPathS).toHaveBeenCalledWith(undefined)

        // sort direction+field
        spies.sifterResultP.reset()
        buses.sortDirectionS.push('asc')
        buses.sortFieldS.push('content')
        expect(spies.sifterResultP.mostRecentCall.args[0].options.sort[0]).toEqual({field: 'content', direction: 'asc'}, 'should have changed sort')

        // select prev (by offset)
        spies.selectedRelPathS.reset()
        buses.keyUpS.push()
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual('note 9.md', 'should select last item')
        R.times(() => { buses.keyUpS.push() }, 5)
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual('note 4.md', 'should stepped relPath back the same amount of events')
        R.times(() => { buses.keyUpS.push() }, 4)
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual('note 0.md', 'should stepped relPath back the same amount of events')
        R.times(() => { buses.keyUpS.push() }, 3)
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual('note 0.md', 'should stay on first item')

        // select next (by offset)
        buses.keyEscS.push(undefined) // to reset selection
        spies.selectedRelPathS.reset()
        buses.keyDownS.push()
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual('note 0.md', 'should start at the beginning of list')
        R.times(() => { buses.keyDownS.push() }, 5)
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual('note 5.md', 'should stepped relPath forward the same amount of events')
        R.times(() => { buses.keyDownS.push() }, 6)
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual('note 9.md', 'should stop at end of list')

        // active path/notes change
        spies.selectedRelPathS.reset()
        buses.activePathS.push('/notes/note 7.md')
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual('note 7.md', 'should set the relPath to found note')

        buses.activePathS.push('/notes/whatever')
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual(undefined, 'should unset relPath when there is no match')
        buses.activePathS.push('/notes2/note 7.md')
        expect(spies.selectedRelPathS.mostRecentCall.args[0]).toEqual(undefined, 'should not set for matching relPath in another dir')
      })
    })

    it('should yield an openFile event when open stream triggers', function () {
      expect(spies.openFileS).not.toHaveBeenCalled()
      buses.keyEnterS.push()
      expect(spies.openFileS).toHaveBeenCalled()
    })
  })
})
