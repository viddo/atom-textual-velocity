/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import Path from 'path'
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
      filesP: new Bacon.Bus(),
      forcedScrollTopP: new Bacon.Bus(),
      listHeightP: new Bacon.Bus(),
      loadingS: new Bacon.Bus(),
      openFileS: new Bacon.Bus(),
      notesPathS: new Bacon.Bus(),
      paginationP: new Bacon.Bus(),
      rowHeightP: new Bacon.Bus(),
      saveEditedCellContentS: new Bacon.Bus(),
      selectedPathS: new Bacon.Bus(),
      sifterResultP: new Bacon.Bus()
    }

    const interactor = {
      editCellNameP: buses.editCellNameP.toProperty(undefined),
      filesP: buses.filesP.toProperty([]),
      forcedScrollTopP: buses.forcedScrollTopP.toProperty(undefined),
      listHeightP: buses.listHeightP.toProperty(123),
      loadingS: buses.loadingS,
      openFileS: buses.openFileS,
      notesPathS: buses.notesPathS,
      paginationP: buses.paginationP.toProperty({start: 0, limit: 5}),
      rowHeightP: buses.rowHeightP.toProperty(23),
      saveEditedCellContentS: buses.saveEditedCellContentS,
      selectedPathS: buses.selectedPathS,
      sifterResultP: buses.sifterResultP.toProperty()
    }

    nameColumn = {
      editCellName: 'name',
      editCellStr: file => file.name,
      sortField: 'name',
      title: 'Filename',
      width: 90,
      cellContent: (file, template) => file.name
    }
    extColumn = {
      sortField: 'ext',
      title: 'File extension',
      width: 10,
      cellContent: (file, template) => file.ext
    }
    const columnsP = Bacon.constant([nameColumn, extColumn])
    spyOn(nameColumn, 'cellContent').andCallThrough()

    presenter = new Presenter(interactor, columnsP)

    spies = {
      columnHeadersP: jasmine.createSpy('columnHeadersP'),
      forcedScrollTopP: jasmine.createSpy('forcedScrollTopP'),
      itemsCountP: jasmine.createSpy('itemsCountP'),
      listHeightP: jasmine.createSpy('listHeightP'),
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
    expect(spies.paginationP).toHaveBeenCalledWith({start: 0, limit: 5})
    expect(spies.rowHeightP).toHaveBeenCalledWith(23)
  })

  it('should not yield any values for props that depend on the initial sifter result', function () {
    expect(spies.itemsCountP).not.toHaveBeenCalled()
    expect(spies.rowsS).not.toHaveBeenCalled()
    expect(spies.searchStrP).not.toHaveBeenCalled()
    expect(spies.sortP).not.toHaveBeenCalled()
  })

  describe('when interactor loadingS stream is triggered', function () {
    let allFiles

    beforeEach(function () {
      const notesPathS = NotesPath(__dirname)
      buses.notesPathS.push(notesPathS)
      buses.loadingS.push()

      // simulate filesP beings populated:
      buses.filesP.push([])
      allFiles = R.times(i => {
        const file = notesPathS.newFile(`file ${i}.md`)
        file.content = `content of file ${i}`
        return file
      }, 10)
      buses.filesP.push(allFiles)
    })

    it('should trigger presenter loadingS stream', function () {
      expect(spies.loadingS).toHaveBeenCalled()
    })

    it('should not yield rows just yet', function () {
      expect(spies.rowsS).not.toHaveBeenCalled()
    })

    describe('when there is a sifter result', function () {
      beforeEach(function () {
        buses.sifterResultP.push(
          newSifterResult({
            total: 10,
            items: allFiles.map(file => ({id: allFiles.indexOf(file)}))
          })
        )
      })

      it('should yields values for props related to results', function () {
        expect(spies.itemsCountP).toHaveBeenCalledWith(10)
        expect(spies.rowsS).toHaveBeenCalled()
        expect(spies.searchStrP).toHaveBeenCalledWith('')
        expect(spies.sortP).toHaveBeenCalledWith({field: 'name', direction: 'desc'})
      })

      it('should yields rows', function () {
        expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
        expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(5)
        expect(spies.rowsS.mostRecentCall.args[0][0]).toEqual({
          id: jasmine.any(String),
          index: jasmine.any(Number),
          selected: false,
          cells: jasmine.any(Array)
        })
        expect(spies.rowsS.mostRecentCall.args[0][0].cells).toEqual([
          {content: 'file 0', editCellName: 'name'},
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
            items: allFiles
              .slice(3)
              .map(file => ({id: allFiles.indexOf(file)}))
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
              {content: 'file 3', editCellName: 'name'},
              {content: '.md', editCellName: undefined}
            ]
          })
        )
        expect(spies.rowsS.mostRecentCall.args[0].map(x => x.index)).toEqual([0, 1, 2, 3, 4], 'index in asc order')
        expect(spies.rowsS.mostRecentCall.args[0].map(x => x.selected)).not.toContain(true, 'all items unselected')
      })

      it('should provide tokens to cellContent to highlight matches', function () {
        expect(nameColumn.cellContent).toHaveBeenCalled()
        expect(nameColumn.cellContent.mostRecentCall.args[1]).toEqual(jasmine.any(Object))
        expect(nameColumn.cellContent.mostRecentCall.args[1].content).toEqual(jasmine.any(Function))
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
            [{content: 'file 7', editCellName: 'name'}, {content: '.md', editCellName: undefined}],
            [{content: 'file 8', editCellName: 'name'}, {content: '.md', editCellName: undefined}],
            [{content: 'file 9', editCellName: 'name'}, {content: '.md', editCellName: undefined}]
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

      describe('when a file is selected', function () {
        beforeEach(function () {
          buses.selectedPathS.push(Path.join(__dirname, 'file 5.md'))
        })

        it('should yield new rows', function () {
          expect(spies.rowsS.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
          expect(spies.rowsS.mostRecentCall.args[0].length).toEqual(5)
          expect(spies.rowsS.mostRecentCall.args[0].map(x => x.index)).toEqual([0, 1, 2, 3, 4], 'index should still be from 0 in asc order')
          expect(spies.rowsS.mostRecentCall.args[0].findIndex(x => x.selected)).toEqual(2)
        })

        it('should preview the item', function () {
          expect(spies.selectedPathS).toHaveBeenCalled()
          expect(spies.selectedPathS.mostRecentCall.args[0]).toMatch(/.+file 5.md/)
          expect(spies.openPathS).not.toHaveBeenCalled()
        })

        it('should open file when triggered by that open stream', function () {
          expect(spies.openPathS).not.toHaveBeenCalled()
          buses.openFileS.push()
          expect(spies.openPathS).toHaveBeenCalled()
          expect(spies.openPathS.mostRecentCall.args[0]).toMatch(/.+file 5.md/)
        })
      })

      it('should open new file when there is no selected file', function () {
        expect(spies.openPathS).not.toHaveBeenCalled()
        buses.openFileS.push()
        expect(spies.openPathS).toHaveBeenCalled()
        expect(spies.openPathS.mostRecentCall.args[0]).toMatch(/.+str.md/)

        buses.sifterResultP.push(
          newSifterResult({query: ''})
        )
        buses.openFileS.push()
        expect(spies.openPathS.mostRecentCall.args[0]).toMatch(/.+untitled.md/)
      })
    })
  })
})
