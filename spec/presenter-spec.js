/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import NotesPath from '../lib/notes-path'
import Presenter from '../lib/presenter'

xdescribe('presenter', function () {
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
      notesP: new Bacon.Bus(),
      notesPathP: new Bacon.Bus(),
      openFileS: new Bacon.Bus(),
      paginationP: new Bacon.Bus(),
      rowHeightP: new Bacon.Bus(),
      saveEditedCellContentS: new Bacon.Bus(),
      searchStrS: new Bacon.Bus(),
      selectedFilenameS: new Bacon.Bus(),
      sifterResultP: new Bacon.Bus()
    }

    const interactor = {
      editCellNameP: buses.editCellNameP.toProperty(undefined),
      forcedScrollTopP: buses.forcedScrollTopP.toProperty(undefined),
      listHeightP: buses.listHeightP.toProperty(123),
      loadingS: buses.loadingS,
      notesP: buses.notesP.toProperty([]),
      notesPathP: buses.notesPathP.toProperty(),
      openFileS: buses.openFileS,
      paginationP: buses.paginationP.toProperty({start: 0, limit: 5}),
      rowHeightP: buses.rowHeightP.toProperty(23),
      saveEditedCellContentS: buses.saveEditedCellContentS,
      searchStrS: buses.searchStrS,
      selectedFilenameS: buses.selectedFilenameS,
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
      className: 'file-icons',
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
      newPathP: jasmine.createSpy('newPathP'),
      openPathS: jasmine.createSpy('openPathS'),
      paginationP: jasmine.createSpy('paginationP'),
      rowHeightP: jasmine.createSpy('rowHeightP'),
      rowsS: jasmine.createSpy('rowsS'),
      searchRegexP: jasmine.createSpy('searchRegexP'),
      searchStrP: jasmine.createSpy('searchStrP'),
      selectedContentP: jasmine.createSpy('selectedContentP'),
      selectedPathP: jasmine.createSpy('selectedPathP'),
      sortP: jasmine.createSpy('sortP')
    }
    presenter.columnHeadersP.onValue(spies.columnHeadersP)
    presenter.forcedScrollTopP.onValue(spies.forcedScrollTopP)
    presenter.itemsCountP.onValue(spies.itemsCountP)
    presenter.listHeightP.onValue(spies.listHeightP)
    presenter.loadingProgressP.onValue(spies.loadingProgressP)
    presenter.loadingS.onValue(spies.loadingS)
    presenter.newPathP.onValue(spies.newPathP)
    presenter.openPathS.onValue(spies.openPathS)
    presenter.paginationP.onValue(spies.paginationP)
    presenter.rowHeightP.onValue(spies.rowHeightP)
    presenter.rowsS.onValue(spies.rowsS)
    presenter.searchRegexP.onValue(spies.searchRegexP)
    presenter.searchStrP.onValue(spies.searchStrP)
    presenter.selectedContentP.onValue(spies.selectedContentP)
    presenter.selectedPathP.onValue(spies.selectedPathP)
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
      atom.config.set('textual-velocity.defaultExt', 'md')

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
        buses.searchStrS.push('')
        buses.sifterResultP.push(
          newSifterResult({
            total: 10,
            items: Object.keys(notes).map(filename => ({id: filename}))
          })
        )
      })

      it('should yields values for props related to results', function () {
        expect(spies.itemsCountP).toHaveBeenCalledWith(10)
        expect(spies.loadingProgressP).toHaveBeenCalledWith({total: 0, ready: 0})
        expect(spies.rowsS).toHaveBeenCalled()
        expect(spies.searchRegexP).toHaveBeenCalledWith(undefined)
        expect(spies.searchStrP).toHaveBeenCalledWith('')
        expect(spies.sortP).toHaveBeenCalledWith({field: 'name', direction: 'desc'})
      })

      it('should yields rows', function () {
        expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
        expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(5)
        const row = spies.rowsS.mostRecentCall.args[0][0]
        expect(row.id).toEqual(jasmine.any(String))
        expect(row.filename).toEqual(jasmine.any(String))
        expect(row.selected).toBe(false)
        expect(row.cells).toEqual(jasmine.any(Array))
        expect(spies.rowsS.mostRecentCall.args[0][0].cells).toEqual([
          {className: '', content: 'note 0', editCellName: 'name'},
          {className: 'file-icons', content: '.md', editCellName: undefined}
        ])
      })
    })

    describe('when a search query is given', function () {
      beforeEach(function () {
        buses.searchStrS.push('STR')
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
              .map(filename => ({id: filename}))
          })
        )
      })

      it('should yield new valus for props related to results', function () {
        expect(spies.itemsCountP).toHaveBeenCalledWith(7)
        expect(spies.searchRegexP).toHaveBeenCalledWith(jasmine.any(RegExp))
        expect(spies.searchStrP).toHaveBeenCalledWith('STR')
      })

      it('should yield new rows', function () {
        expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
        expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(5)
        expect(spies.rowsS.mostRecentCall.args[0][0]).toEqual(
          jasmine.objectContaining({
            id: jasmine.any(String),
            cells: [
              {className: '', content: 'note 3', editCellName: 'name'},
              {className: 'file-icons', content: '.md', editCellName: undefined}
            ]
          })
        )
        expect(spies.rowsS.mostRecentCall.args[0][0].filename).toEqual('note 3.md', 'filename in asc order')
        expect(spies.rowsS.mostRecentCall.args[0][4].filename).toEqual('note 7.md', 'filename in asc order')
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
            [{className: '', content: 'note 7', editCellName: 'name'}, {className: 'file-icons', content: '.md', editCellName: undefined}],
            [{className: '', content: 'note 8', editCellName: 'name'}, {className: 'file-icons', content: '.md', editCellName: undefined}],
            [{className: '', content: 'note 9', editCellName: 'name'}, {className: 'file-icons', content: '.md', editCellName: undefined}]
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
          buses.selectedFilenameS.push('note 5.md')
        })

        it('should yield new rows', function () {
          expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
          expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(5)
          expect(spies.rowsS.mostRecentCall.args[0][0].filename).toEqual('note 3.md', 'should start from first note')
          expect(spies.rowsS.mostRecentCall.args[0].findIndex(row => row.selected)).toEqual(2)
        })

        it('should yield selected path', function () {
          expect(spies.selectedPathP).toHaveBeenCalled()
          expect(spies.selectedPathP.mostRecentCall.args[0]).toMatch(/.+note 5.md/)
        })

        it('should yield selected note content', function () {
          expect(spies.selectedContentP).toHaveBeenCalled()
          expect(spies.selectedContentP.mostRecentCall.args[0]).toEqual('content of note 5')
        })

        it('should not yield a value on openPath stream', function () {
          expect(spies.openPathS).not.toHaveBeenCalled()
        })

        it('should open note when triggered by that open stream', function () {
          expect(spies.openPathS).not.toHaveBeenCalled()
          buses.openFileS.push()
          expect(spies.openPathS).toHaveBeenCalled()
        })

        describe('when a note is deselected', function () {
          beforeEach(function () {
            buses.selectedFilenameS.push(undefined)
          })

          it('should yield empty path', function () {
            expect(spies.selectedPathP.mostRecentCall.args[0]).toBeFalsy()
          })

          it('should should yield empty content', function () {
            expect(spies.selectedContentP.mostRecentCall.args[0]).toBeFalsy()
          })
        })
      })

      it('should open new note when there is no selected note', function () {
        buses.selectedFilenameS.push('note 3.md') // preqrequisite for open

        expect(spies.openPathS).not.toHaveBeenCalled()
        buses.openFileS.push()
        expect(spies.openPathS).toHaveBeenCalled()
        expect(spies.selectedPathP.mostRecentCall.args[0]).toEqual('/notes/note 3.md')
        expect(spies.newPathP.mostRecentCall.args[0]).toEqual('/notes/STR.md', 'new path should have a default extension')

        buses.searchStrS.push('')
        buses.sifterResultP.push(
          newSifterResult({query: ''})
        )
        buses.selectedFilenameS.push(undefined)
        buses.searchStrS.push('')
        expect(spies.openPathS).toHaveBeenCalled()
        expect(spies.newPathP.mostRecentCall.args[0]).toEqual('/notes/untitled.md', 'new path should have default file name + extension')

        atom.config.set('textual-velocity.defaultExt', '.txt')
        buses.searchStrS.push('')
        expect(spies.openPathS).toHaveBeenCalled()
        expect(spies.newPathP.mostRecentCall.args[0]).toEqual('/notes/untitled.txt', 'new path should have custom file extension')
      })
    })
  })
})
