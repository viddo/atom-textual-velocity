/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import Presenter from '../lib/presenter'
import NotesPath from '../lib/notes-path'

describe('presenter', function () {
  let buses, presenter, spies, nameColumn, extColumn

  const newSifterResult = (obj = {}) => {
    return R.merge({
      options: {
        sort: [
          {field: 'name', direction: 'desc'},
          {field: '$core', direction: 'desc'}
        ]
      },
      query: '',
      tokens: [],
      total: 0,
      items: []
    }, obj)
  }

  beforeEach(function () {
    buses = {
      editCellNameP: new Bacon.Bus(),
      forcedScrollTopP: new Bacon.Bus(),
      listHeightP: new Bacon.Bus(),
      loadingS: new Bacon.Bus(),
      openFileS: new Bacon.Bus(),
      notesP: new Bacon.Bus(),
      notesPathP: new Bacon.Bus(),
      paginationP: new Bacon.Bus(),
      rowHeightP: new Bacon.Bus(),
      saveEditedCellContentS: new Bacon.Bus(),
      selectedRelPathS: new Bacon.Bus(),
      sifterResultP: new Bacon.Bus()
    }

    const interactor = {
      editCellNameP: buses.editCellNameP.toProperty(undefined),
      forcedScrollTopP: buses.forcedScrollTopP.toProperty(undefined),
      listHeightP: buses.listHeightP.toProperty(123),
      loadingS: buses.loadingS,
      openFileS: buses.openFileS,
      notesP: buses.notesP.toProperty([]),
      notesPathP: buses.notesPathP.toProperty(),
      paginationP: buses.paginationP.toProperty({start: 0, limit: 5}),
      rowHeightP: buses.rowHeightP.toProperty(23),
      saveEditedCellContentS: buses.saveEditedCellContentS,
      selectedRelPathS: buses.selectedRelPathS,
      sifterResultP: buses.sifterResultP.toProperty()
    }

    nameColumn = {
      editCellName: 'name',
      editCellStr: note => note.name,
      sortField: 'name',
      title: 'Filename',
      width: 90,
      cellContent: (params: CellContentParamsType) => params.note.name
    }
    extColumn = {
      sortField: 'ext',
      title: 'File extension',
      width: 10,
      cellContent: (params: CellContentParamsType) => params.note.ext
    }
    const columnsP = Bacon.constant([nameColumn, extColumn])
    spyOn(nameColumn, 'cellContent').andCallThrough()

    presenter = new Presenter(interactor, columnsP)

    spies = {
      columnHeadersP: jasmine.createSpy('columnHeadersP'),
      forcedScrollTopP: jasmine.createSpy('forcedScrollTopP'),
      itemsCountP: jasmine.createSpy('itemsCountP'),
      listHeightP: jasmine.createSpy('listHeightP'),
      loadingProgressP: jasmine.createSpy('loadingProgressP'),
      loadingS: jasmine.createSpy('loadingS'),
      paginationP: jasmine.createSpy('paginationP'),
      openPathS: jasmine.createSpy('openPathS'),
      selectedPathS: jasmine.createSpy('selectedPathS'),
      rowHeightP: jasmine.createSpy('rowHeightP'),
      rowsS: jasmine.createSpy('rowsS'),
      searchStrP: jasmine.createSpy('searchStrP'),
      sortP: jasmine.createSpy('sortP')
    }
    presenter.columnHeadersP.onValue(spies.columnHeadersP)
    presenter.forcedScrollTopP.onValue(spies.forcedScrollTopP)
    presenter.itemsCountP.onValue(spies.itemsCountP)
    presenter.listHeightP.onValue(spies.listHeightP)
    presenter.loadingProgressP.onValue(spies.loadingProgressP)
    presenter.loadingS.onValue(spies.loadingS)
    presenter.paginationP.onValue(spies.paginationP)
    presenter.openPathS.onValue(spies.openPathS)
    presenter.selectedPathS.onValue(spies.selectedPathS)
    presenter.rowHeightP.onValue(spies.rowHeightP)
    presenter.rowsS.onValue(spies.rowsS)
    presenter.searchStrP.onValue(spies.searchStrP)
    presenter.sortP.onValue(spies.sortP)
  })

  it('should yield some initial state independent props', function () {
    expect(spies.columnHeadersP).toHaveBeenCalledWith(jasmine.any(Array))
    expect(spies.forcedScrollTopP).toHaveBeenCalledWith(undefined)
    expect(spies.listHeightP).toHaveBeenCalledWith(123)
    expect(spies.loadingProgressP).toHaveBeenCalledWith({total: 0, ready: 0})
    expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 5})
    expect(spies.rowHeightP).toHaveBeenCalledWith(23)
  })

  it('should not yield any values for props that depend on the initial sifter result', function () {
    expect(spies.itemsCountP).not.toHaveBeenCalled()
    expect(spies.rowsS).not.toHaveBeenCalled()
    expect(spies.searchStrP).not.toHaveBeenCalled()
    expect(spies.sortP).not.toHaveBeenCalled()
  })

  describe('when interactor loading stream is triggered', function () {
    let notes

    beforeEach(function () {
      const notesPathP = NotesPath('/notes')
      buses.notesPathP.push(notesPathP)
      buses.loadingS.push()

      // simulate notesP beings populated:
      buses.notesP.push({})
      notes = {}
      R.times(i => {
        notes[`note ${i}.md`] = {
          id: `id-${i}`,
          name: `note ${i}`,
          ext: '.md',
          content: `content of note ${i}`,
          ready: true
        }
      }, 10)
      notes['note 9.md'].ready = false // simulate last item not ready yet
      buses.notesP.push(notes)
    })

    it('should trigger presenter loading observables', function () {
      expect(spies.loadingProgressP).toHaveBeenCalledWith({total: 10, ready: 9})
      expect(spies.loadingS).toHaveBeenCalled()
    })

    it('should not yield rows just yet', function () {
      expect(spies.rowsS).not.toHaveBeenCalled()
    })

    describe('when there is a sifter result', function () {
      beforeEach(function () {
        notes['note 9.md'].ready = true // simulate last item ready
        buses.notesP.push(notes)
        buses.sifterResultP.push(
          newSifterResult({
            total: 10,
            items: Object.keys(notes).map(relPath => ({id: relPath}))
          })
        )
      })

      it('should yields values for props related to results', function () {
        expect(spies.itemsCountP).toHaveBeenCalledWith(10)
        expect(spies.loadingProgressP).toHaveBeenCalledWith({total: 0, ready: 0})
        expect(spies.rowsS).toHaveBeenCalled()
        expect(spies.searchStrP).toHaveBeenCalledWith('')
        expect(spies.sortP).toHaveBeenCalledWith({field: 'name', direction: 'desc'})
      })

      it('should yields rows', function () {
        expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
        expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(5)
        const row = spies.rowsS.mostRecentCall.args[0][0]
        expect(row.id).toEqual(jasmine.any(String))
        expect(row.relPath).toEqual(jasmine.any(String))
        expect(row.selected).toBe(false)
        expect(row.cells).toEqual(jasmine.any(Array))
        expect(spies.rowsS.mostRecentCall.args[0][0].cells).toEqual([
          {content: 'note 0', editCellName: 'name'},
          {content: '.md', editCellName: undefined}
        ])
      })
    })

    describe('when a search query is given', function () {
      beforeEach(function () {
        buses.sifterResultP.push(
          newSifterResult({
            tokens: [{
              string: 'str',
              regex: /[aÀÁÂÃÄÅàáâãäå][nÑñ][nÑñ][aÀÁÂÃÄÅàáâãäå]/
            }],
            query: 'str',
            total: 7,
            items: Object
              .keys(notes)
              .slice(3)
              .map(relPath => ({id: relPath}))
          })
        )
      })

      it('should yield new valus for props related to results', function () {
        expect(spies.itemsCountP).toHaveBeenCalledWith(7)
        expect(spies.searchStrP).toHaveBeenCalledWith('str')
      })

      it('should yield new rows', function () {
        expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
        expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(5)
        expect(spies.rowsS.mostRecentCall.args[0][0]).toEqual(
          jasmine.objectContaining({
            id: jasmine.any(String),
            cells: [
              {content: 'note 3', editCellName: 'name'},
              {content: '.md', editCellName: undefined}
            ]
          })
        )
        expect(spies.rowsS.mostRecentCall.args[0][0].relPath).toEqual('note 3.md', 'relPath in asc order')
        expect(spies.rowsS.mostRecentCall.args[0][4].relPath).toEqual('note 7.md', 'relPath in asc order')
        expect(spies.rowsS.mostRecentCall.args[0].indexOf(row => row.selected)).toEqual(-1, 'all items unselected')
      })

      it('should format cell contents', function () {
        expect(nameColumn.cellContent).toHaveBeenCalled()

        const params = nameColumn.cellContent.mostRecentCall.args[0]
        expect(params.note).toEqual(jasmine.objectContaining({id: jasmine.any(String)}), 'should provide note')
        expect(params.path).toEqual(jasmine.any(String), 'should provide path')
        expect(params.searchMatch).toEqual(jasmine.any(Object), 'should provide tokens to cellContent to highlight matches')
        expect(params.searchMatch.content).toEqual(jasmine.any(Function))
      })

      describe('when interactor paginationP changes', function () {
        beforeEach(function () {
          buses.paginationP.push({start: 4, limit: 3})
        })

        it('should update the paginationP', function () {
          expect(spies.paginationP).toHaveBeenCalledWith({start: 4, limit: 3})
        })

        it('should yields rows', function () {
          expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
          expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(3)
          expect(spies.rowsS.mostRecentCall.args[0].map(x => x.cells)).toEqual([
            [{content: 'note 7', editCellName: 'name'}, {content: '.md', editCellName: undefined}],
            [{content: 'note 8', editCellName: 'name'}, {content: '.md', editCellName: undefined}],
            [{content: 'note 9', editCellName: 'name'}, {content: '.md', editCellName: undefined}]
          ])
        })
      })

      describe('when interactor forcedScrollTopP changes', function () {
        beforeEach(function () {
          buses.forcedScrollTopP.push(0)
        })

        it('should yield new value on prop', function () {
          expect(spies.forcedScrollTopP).toHaveBeenCalledWith(0)
        })
      })

      describe('when a note is selected', function () {
        beforeEach(function () {
          buses.selectedRelPathS.push('note 5.md')
        })

        it('should yield new rows', function () {
          expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
          expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(5)
          expect(spies.rowsS.mostRecentCall.args[0][0].relPath).toEqual('note 3.md', 'should start from first note')
          expect(spies.rowsS.mostRecentCall.args[0].findIndex(row => row.selected)).toEqual(2)
        })

        it('should preview the item', function () {
          expect(spies.selectedPathS).toHaveBeenCalled()
          expect(spies.selectedPathS.mostRecentCall.args[0]).toMatch(/.+note 5.md/)
          expect(spies.openPathS).not.toHaveBeenCalled()
        })

        it('should open note when triggered by that open stream', function () {
          expect(spies.openPathS).not.toHaveBeenCalled()
          buses.openFileS.push()
          expect(spies.openPathS).toHaveBeenCalled()
          expect(spies.openPathS.mostRecentCall.args[0]).toMatch(/.+note 5.md/)
        })
      })

      it('should open new note when there is no selected note', function () {
        buses.selectedRelPathS.push('note 3.md') // preqrequisite for open

        expect(spies.openPathS).not.toHaveBeenCalled()
        buses.openFileS.push()
        expect(spies.openPathS).toHaveBeenCalled()
        expect(spies.openPathS.mostRecentCall.args[0]).toEqual('/notes/note 3.md')

        buses.sifterResultP.push(
          newSifterResult({query: ''})
        )
        buses.selectedRelPathS.push(undefined)
        buses.openFileS.push()
        expect(spies.openPathS.mostRecentCall.args[0]).toEqual('/notes/untitled.md')
      })
    })
  })
})
