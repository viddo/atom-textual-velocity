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
      editCellNameProp: new Bacon.Bus(),
      files: new Bacon.Bus(),
      forcedScrollTop: new Bacon.Bus(),
      listHeight: new Bacon.Bus(),
      loading: new Bacon.Bus(),
      openFile: new Bacon.Bus(),
      notesPath: new Bacon.Bus(),
      pagination: new Bacon.Bus(),
      rowHeight: new Bacon.Bus(),
      saveEditedCellContent: new Bacon.Bus(),
      selectedIndex: new Bacon.Bus(),
      sifterResult: new Bacon.Bus()
    }

    const interactor = {
      editCellNameProp: buses.editCellNameProp.toProperty(undefined),
      filesProp: buses.files.toProperty([]),
      forcedScrollTopProp: buses.forcedScrollTop.toProperty(undefined),
      listHeightProp: buses.listHeight.toProperty(123),
      loadingStream: buses.loading,
      openFileStream: buses.openFile,
      notesPathStream: buses.notesPath,
      paginationProp: buses.pagination.toProperty({start: 0, limit: 5}),
      rowHeightProp: buses.rowHeight.toProperty(23),
      saveEditedCellContentStream: buses.saveEditedCellContent,
      selectedIndexProp: buses.selectedIndex.toProperty(undefined),
      sifterResultProp: buses.sifterResult.toProperty()
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
    const columnsProp = Bacon.constant([nameColumn, extColumn])
    spyOn(nameColumn, 'cellContent').andCallThrough()

    presenter = new Presenter(interactor, columnsProp)

    spies = {
      columnHeadersProp: jasmine.createSpy('columnHeadersProp'),
      forcedScrollTopProp: jasmine.createSpy('forcedScrollTopProp'),
      itemsCountProp: jasmine.createSpy('itemsCountProp'),
      listHeightProp: jasmine.createSpy('listHeightProp'),
      loadingStream: jasmine.createSpy('loadingStream'),
      paginationProp: jasmine.createSpy('paginationProp'),
      openPathStream: jasmine.createSpy('openPathStream'),
      selectedPathStream: jasmine.createSpy('selectedPathStream'),
      rowHeightProp: jasmine.createSpy('rowHeightProp'),
      rowsStream: jasmine.createSpy('rowsStream'),
      searchStrProp: jasmine.createSpy('searchStrProp'),
      sortProp: jasmine.createSpy('sortProp')
    }
    presenter.columnHeadersProp.onValue(spies.columnHeadersProp)
    presenter.forcedScrollTopProp.onValue(spies.forcedScrollTopProp)
    presenter.itemsCountProp.onValue(spies.itemsCountProp)
    presenter.listHeightProp.onValue(spies.listHeightProp)
    presenter.loadingStream.onValue(spies.loadingStream)
    presenter.paginationProp.onValue(spies.paginationProp)
    presenter.openPathStream.onValue(spies.openPathStream)
    presenter.selectedPathStream.onValue(spies.selectedPathStream)
    presenter.rowHeightProp.onValue(spies.rowHeightProp)
    presenter.rowsStream.onValue(spies.rowsStream)
    presenter.searchStrProp.onValue(spies.searchStrProp)
    presenter.sortProp.onValue(spies.sortProp)
  })

  it('should yield some initial state independent props', function () {
    expect(spies.columnHeadersProp).toHaveBeenCalledWith(jasmine.any(Array))
    expect(spies.forcedScrollTopProp).toHaveBeenCalledWith(undefined)
    expect(spies.listHeightProp).toHaveBeenCalledWith(123)
    expect(spies.paginationProp).toHaveBeenCalledWith({start: 0, limit: 5})
    expect(spies.rowHeightProp).toHaveBeenCalledWith(23)
  })

  it('should not yield any values for props that depend on the initial sifter result', function () {
    expect(spies.itemsCountProp).not.toHaveBeenCalled()
    expect(spies.rowsStream).not.toHaveBeenCalled()
    expect(spies.searchStrProp).not.toHaveBeenCalled()
    expect(spies.sortProp).not.toHaveBeenCalled()
  })

  describe('when interactor loading stream is triggered', function () {
    let allFiles

    beforeEach(function () {
      const notesPath = NotesPath(__dirname)
      buses.notesPath.push(notesPath)
      buses.loading.push()

      // simulate files beings populated:
      buses.files.push([])
      allFiles = R.times(i => {
        const file = notesPath.newFile(`file ${i}.md`)
        file.data.content = `content of file ${i}`
        return file
      }, 10)
      buses.files.push(allFiles)
    })

    it('should trigger presenter loading stream', function () {
      expect(spies.loadingStream).toHaveBeenCalled()
    })

    it('should not yield rows just yet', function () {
      expect(spies.rowsStream).not.toHaveBeenCalled()
    })

    describe('when there is a sifter result', function () {
      beforeEach(function () {
        buses.sifterResult.push(
          newSifterResult({
            total: 10,
            items: allFiles.map(file => ({id: allFiles.indexOf(file)}))
          })
        )
      })

      it('should yields values for props related to results', function () {
        expect(spies.itemsCountProp).toHaveBeenCalledWith(10)
        expect(spies.rowsStream).toHaveBeenCalled()
        expect(spies.searchStrProp).toHaveBeenCalledWith('')
        expect(spies.sortProp).toHaveBeenCalledWith({field: 'name', direction: 'desc'})
      })

      it('should yields rows', function () {
        expect(spies.rowsStream.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
        expect(spies.rowsStream.mostRecentCall.args[0].length).toEqual(5)
        expect(spies.rowsStream.mostRecentCall.args[0][0]).toEqual({
          id: jasmine.any(String),
          index: jasmine.any(Number),
          selected: false,
          cells: jasmine.any(Array)
        })
        expect(spies.rowsStream.mostRecentCall.args[0][0].cells).toEqual([
          {content: 'file 0', editCellName: 'name'},
          {content: '.md', editCellName: undefined}
        ])
      })
    })

    describe('when a search query is given', function () {
      beforeEach(function () {
        buses.sifterResult.push(
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
        expect(spies.itemsCountProp).toHaveBeenCalledWith(7)
        expect(spies.searchStrProp).toHaveBeenCalledWith('str')
      })

      it('should yield new rows', function () {
        expect(spies.rowsStream.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
        expect(spies.rowsStream.mostRecentCall.args[0].length).toEqual(5)
        expect(spies.rowsStream.mostRecentCall.args[0][0]).toEqual(
          jasmine.objectContaining({
            id: jasmine.any(String),
            cells: [
              {content: 'file 3', editCellName: 'name'},
              {content: '.md', editCellName: undefined}
            ]
          })
        )
        expect(spies.rowsStream.mostRecentCall.args[0].map(x => x.index)).toEqual([0, 1, 2, 3, 4], 'index in asc order')
        expect(spies.rowsStream.mostRecentCall.args[0].map(x => x.selected)).not.toContain(true, 'all items unselected')
      })

      it('should provide tokens to cellContent to highlight matches', function () {
        expect(nameColumn.cellContent).toHaveBeenCalled()
        expect(nameColumn.cellContent.mostRecentCall.args[1]).toEqual(jasmine.any(Object))
        expect(nameColumn.cellContent.mostRecentCall.args[1].content).toEqual(jasmine.any(Function))
      })

      describe('when interactor pagination changes', function () {
        beforeEach(function () {
          buses.pagination.push({start: 4, limit: 3})
        })

        it('should update the pagination', function () {
          expect(spies.paginationProp).toHaveBeenCalledWith({start: 4, limit: 3})
        })

        it('should yields rows', function () {
          expect(spies.rowsStream.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
          expect(spies.rowsStream.mostRecentCall.args[0].length).toEqual(3)
          expect(spies.rowsStream.mostRecentCall.args[0].map(x => x.cells)).toEqual([
            [{content: 'file 7', editCellName: 'name'}, {content: '.md', editCellName: undefined}],
            [{content: 'file 8', editCellName: 'name'}, {content: '.md', editCellName: undefined}],
            [{content: 'file 9', editCellName: 'name'}, {content: '.md', editCellName: undefined}]
          ])
        })
      })

      describe('when interactor forcedScrollTopProp changes', function () {
        beforeEach(function () {
          buses.forcedScrollTop.push(0)
        })

        it('should yield new value on prop', function () {
          expect(spies.forcedScrollTopProp).toHaveBeenCalledWith(0)
        })
      })

      describe('when a file is selected', function () {
        beforeEach(function () {
          buses.selectedIndex.push(2)
        })

        it('should yield new rows', function () {
          expect(spies.rowsStream.mostRecentCall.args[0]).toEqual(jasmine.any(Array))
          expect(spies.rowsStream.mostRecentCall.args[0].length).toEqual(5)
          expect(spies.rowsStream.mostRecentCall.args[0].map(x => x.index)).toEqual([0, 1, 2, 3, 4], 'index should still be from 0 in asc order')
          expect(spies.rowsStream.mostRecentCall.args[0].map(x => x.selected)).toEqual([false, false, true, false, false], 'selected index selected')
        })

        it('should preview the item', function () {
          expect(spies.selectedPathStream).toHaveBeenCalled()
          expect(spies.selectedPathStream.mostRecentCall.args[0]).toMatch(/.+file 5.md/)
          expect(spies.openPathStream).not.toHaveBeenCalled()
        })

        it('should open file when triggered by that open stream', function () {
          expect(spies.openPathStream).not.toHaveBeenCalled()
          buses.openFile.push()
          expect(spies.openPathStream).toHaveBeenCalled()
          expect(spies.openPathStream.mostRecentCall.args[0]).toMatch(/.+file 5.md/)
        })
      })

      it('should open new file when there is no selected file', function () {
        expect(spies.openPathStream).not.toHaveBeenCalled()
        buses.openFile.push()
        expect(spies.openPathStream).toHaveBeenCalled()
        expect(spies.openPathStream.mostRecentCall.args[0]).toMatch(/.+str.md/)

        buses.sifterResult.push(
          newSifterResult({query: ''})
        )
        buses.openFile.push()
        expect(spies.openPathStream.mostRecentCall.args[0]).toMatch(/.+untitled.md/)
      })
    })
  })
})
