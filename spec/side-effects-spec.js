/* @flow */

import Bacon from 'baconjs'
import SideEffects from '../lib/side-effects'
import ViewCtrl from '../lib/view-ctrl'
import defaultConfig from '../lib/default-config'

xdescribe('side-effects', function () {
  let workspaceElement, buses, panel, sideEffects, viewCtrl, presenter, spies, input

  const assertTextInputFocus = () => {
    expect(input.select).not.toHaveBeenCalled()
    advanceClock(1000)
    expect(input.select).toHaveBeenCalled()
    expect(input.focus).toHaveBeenCalled()
    expect(panel.getItem().querySelector).toHaveBeenCalledWith('input')
  }

  beforeEach(function () {
    atom.config.set('textual-velocity.listHeight', 123)
    spyOn(atom.workspace, 'open').andCallThrough()

    buses = {
      columnHeadersP: new Bacon.Bus(),
      forcedScrollTopP: new Bacon.Bus(),
      itemsCountP: new Bacon.Bus(),
      listHeightS: new Bacon.Bus(),
      loadingProgressP: new Bacon.Bus(),
      loadingS: new Bacon.Bus(),
      newPathP: new Bacon.Bus(),
      openPathS: new Bacon.Bus(),
      paginationP: new Bacon.Bus(),
      saveEditedCellContentS: new Bacon.Bus(),
      rowHeightP: new Bacon.Bus(),
      rowsS: new Bacon.Bus(),
      searchRegexP: new Bacon.Bus(),
      searchStrP: new Bacon.Bus(),
      selectedContentP: new Bacon.Bus(),
      selectedPathP: new Bacon.Bus(),
      sortP: new Bacon.Bus(),

      columnsP: new Bacon.Bus(),
      editCellS: new Bacon.Bus(),
      fieldsP: new Bacon.Bus(),
      fileReadersP: new Bacon.Bus(),
      fileWritersP: new Bacon.Bus()
    }

    const testColumn: ColumnHeaderType = {
      id: 'test',
      sortField: 'name',
      title: 'Test column',
      width: 100
    }

    presenter = {
      columnHeadersP: buses.columnHeadersP.toProperty([testColumn]),
      forcedScrollTopP: buses.forcedScrollTopP.toProperty(undefined),
      itemsCountP: buses.itemsCountP.toProperty(),
      listHeightP: buses.listHeightS.toProperty(100),
      loadingProgressP: buses.loadingProgressP.toProperty({read: 0, total: 0}),
      loadingS: buses.loadingS,
      newPathP: buses.newPathP.toProperty(),
      openPathS: buses.openPathS,
      paginationP: buses.paginationP.toProperty({start: 0, limit: 0}),
      rowHeightP: buses.rowHeightP.toProperty(20),
      rowsS: buses.rowsS,
      saveEditedCellContentS: buses.saveEditedCellContentS,
      searchRegexP: buses.searchRegexP.toProperty(),
      searchStrP: buses.searchStrP.toProperty(),
      selectedContentP: buses.selectedContentP.toProperty(),
      selectedPathP: buses.selectedPathP.toProperty(),
      sortP: buses.sortP.toProperty()
    }

    viewCtrl = new ViewCtrl(panel)
    spyOn(viewCtrl, 'renderLoading')
    spyOn(viewCtrl, 'renderResults')

    panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })
    spyOn(panel.getItem(), 'querySelector')

    const service = {
      columnsP: buses.columnsP,
      editCellS: buses.editCellS,
      fieldsP: buses.fieldsP,
      fileReadersP: buses.fileReadersP,
      fileWritersP: buses.fileWritersP,
      notes: {}
    }

    sideEffects = new SideEffects(panel, viewCtrl, presenter, service)

    spies = {
      listHeightS: jasmine.createSpy('listHeight'),
      rowHeightP: jasmine.createSpy('rowHeightP'),
      sortDirectionS: jasmine.createSpy('sortDirection'),
      sortFieldS: jasmine.createSpy('sortField')
    }

    atom.config.observe('textual-velocity.listHeight', spies.listHeightS)
    atom.config.observe('textual-velocity.rowHeight', spies.rowHeightP)
    atom.config.observe('textual-velocity.sortDirection', spies.sortDirectionS)
    atom.config.observe('textual-velocity.sortField', spies.sortFieldS)

    spies.listHeightS.reset()
    spies.rowHeightP.reset()
    spies.sortDirectionS.reset()
    spies.sortFieldS.reset()

    input = jasmine.createSpyObj('input', ['select', 'focus'])
    panel.getItem().querySelector.andReturn(input)
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)
  })

  afterEach(function () {
    sideEffects.dispose()
  })

  it('should save list height when it changes', function () {
    buses.listHeightS.push(120)
    buses.listHeightS.push(123)
    buses.listHeightS.push(124)
    expect(spies.listHeightS).not.toHaveBeenCalled()
    advanceClock(1000)
    expect(spies.listHeightS).toHaveBeenCalledWith(124)
    expect(spies.listHeightS.calls.length).toEqual(1)
  })

  it('should save sort direction and field when changed', function () {
    buses.sortP.push({field: 'name', direction: 'asc'})
    expect(spies.sortDirectionS).toHaveBeenCalledWith('asc')
    expect(spies.sortFieldS).toHaveBeenCalledWith('name')

    spies.sortDirectionS.reset()
    spies.sortFieldS.reset()
    buses.sortP.push({field: 'name', direction: 'desc'})
    expect(spies.sortDirectionS).toHaveBeenCalledWith('desc')
    expect(spies.sortFieldS).not.toHaveBeenCalled()

    spies.sortDirectionS.reset()
    spies.sortFieldS.reset()
    buses.sortP.push({field: 'ext', direction: 'desc'})
    expect(spies.sortDirectionS).not.toHaveBeenCalled()
    expect(spies.sortFieldS).toHaveBeenCalledWith('ext')
  })

  describe('when window resizes', function () {
    const triggerResizeEvent = () => {
      const event: any = document.createEvent('UIEvents')
      event.initUIEvent('resize', true, false, window, 0)
      window.dispatchEvent(event)
    }

    it('should save row height if there is a valid <td> element to get height from', function () {
      panel.getItem().querySelector.andReturn({clientHeight: 28})
      triggerResizeEvent()
      panel.getItem().querySelector.andReturn({clientHeight: 29})
      triggerResizeEvent()
      expect(spies.rowHeightP).toHaveBeenCalledWith(28)

      advanceClock(1000)
      panel.getItem().querySelector.andReturn({clientHeight: 30})
      triggerResizeEvent()
      expect(spies.rowHeightP).toHaveBeenCalledWith(30)
      expect(panel.getItem().querySelector).toHaveBeenCalledWith('td')
    })

    it('should not break if there is no td', function () {
      spies.rowHeightP.reset()
      panel.getItem().querySelector.andReturn(undefined)
      triggerResizeEvent()
      advanceClock(1000)
      expect(spies.rowHeightP).not.toHaveBeenCalled()
      expect(panel.getItem().querySelector).toHaveBeenCalledWith('td')
    })
  })

  it('should focus on input on focus event', function () {
    atom.commands.dispatch(workspaceElement, 'textual-velocity:focus-on-search')
    assertTextInputFocus()
  })

  describe('when toggle-panel event is triggered', function () {
    beforeEach(function () {
      atom.commands.dispatch(workspaceElement, 'textual-velocity:toggle-panel')
    })

    afterEach(function () {
      panel.show()
    })

    it('should hide/show panel', function () {
      expect(panel.isVisible()).toBe(false)
      atom.commands.dispatch(workspaceElement, 'textual-velocity:toggle-panel')
      expect(panel.isVisible()).toBe(true)
      atom.commands.dispatch(workspaceElement, 'textual-velocity:toggle-panel')
      expect(panel.isVisible()).toBe(false)
    })

    it('should focus on text input when visible', function () {
      atom.commands.dispatch(workspaceElement, 'textual-velocity:toggle-panel')
      assertTextInputFocus()
    })
  })

  describe('when toggle-atom-window event is triggered', function () {
    beforeEach(function () {
      atom.show() // for CLI env to have same window state as testrunner in dev mode
      atom.commands.dispatch(workspaceElement, 'textual-velocity:toggle-atom-window')
    })

    afterEach(function () {
      atom.show()
    })

    it('should hide/show atom window', function () {
      expect(atom.getCurrentWindow().isVisible()).toBe(false)
      atom.commands.dispatch(workspaceElement, 'textual-velocity:toggle-atom-window')
      expect(atom.getCurrentWindow().isVisible()).toBe(true)
      atom.commands.dispatch(workspaceElement, 'textual-velocity:toggle-atom-window')
      expect(atom.getCurrentWindow().isVisible()).toBe(false)
    })

    it('should focus on text input when visible', function () {
      atom.commands.dispatch(workspaceElement, 'textual-velocity:toggle-atom-window')
      assertTextInputFocus()
    })
  })

  describe('when loadingS stream yields a value', function () {
    beforeEach(function () {
      buses.loadingS.push()
    })

    it('should render loading', function () {
      expect(viewCtrl.renderLoading).toHaveBeenCalledWith(100)
    })
  })

  describe('when presentation data yields values', function () {
    beforeEach(function () {
      // initial values related to initial search
      buses.searchStrP.push('')
      buses.itemsCountP.push(0)
      buses.sortP.push({field: 'name', direction: 'desc'})
    })

    // Test values in sequence since interrelated
    it('should render on some yielded values', function () {
      expect(viewCtrl.renderResults).not.toHaveBeenCalledWith()

      // render on rowsS
      buses.rowsS.push([])
      expect(viewCtrl.renderResults).toHaveBeenCalledWith(jasmine.any(Object))

      // do NOT render on the others
      viewCtrl.renderResults.reset()
      atom.config.set('textual-velocity.rowHeight', 20)
      buses.itemsCountP.push(23)
      buses.rowHeightP.push(20)
      buses.searchStrP.push('beep')
      buses.sortP.push({field: 'content', direction: 'asc'})
      expect(viewCtrl.renderResults).not.toHaveBeenCalled()

      // render on scroll
      viewCtrl.renderResults.reset()
      buses.forcedScrollTopP.push(42)
      expect(viewCtrl.renderResults).toHaveBeenCalled()

      // render on list height
      viewCtrl.renderResults.reset()
      buses.listHeightS.push(100)
      expect(viewCtrl.renderResults).toHaveBeenCalled()
    })
  })

  describe('preview', function () {
    describe('when selected a note that is not yet open', function () {
      beforeEach(function () {
        buses.selectedPathP.push('/notes/file.txt')
        buses.selectedContentP.push('foo\nbar\nbaz')
        buses.searchRegexP.push(/ba/)
        advanceClock(1000) // due to atom.workspace.open delay
        waitsFor(() => atom.workspace.getPaneItems().length)
      })

      it('should open a tab with a preview of the note content', function () {
        expect(atom.workspace.getPaneItems()[0].getPath()).toEqual('/notes/file.txt')
      })

      it('should close open tab pane item when deselected', function () {
        buses.selectedPathP.push(undefined)
        buses.selectedContentP.push(undefined)
        expect(atom.workspace.getPaneItems()).not.toEqual([])
        advanceClock(1000)
        expect(atom.workspace.getPaneItems()).toEqual([])
      })

      it('should not close open preview when deselected and other item is open', function () {
        atom.workspace.open('other.txt')
        waitsFor(() => atom.workspace.getActivePaneItem().getPath().endsWith('other.txt'))
        runs(() => {
          buses.selectedPathP.push(undefined)
          buses.selectedContentP.push(undefined)
          advanceClock(1000)
          expect(atom.workspace.getPaneItems().length).toEqual(2)
        })
      })

      it('should leave preview open if there is no content for selected path', function () {
        buses.selectedContentP.push(undefined)
        advanceClock(1000)
        expect(atom.workspace.getPaneItems()).not.toEqual([])
        expect(atom.workspace.getPaneItems()[0].getPath()).toEqual('/notes/file.txt')
      })
    })

    describe('when selected a note that is already open and active', function () {
      it('should reuse open editor if possible', function () {
        // open a note
        atom.workspace.open('/notes/open.txt')
        waitsFor(() => {
          const activeItem = atom.workspace.getActivePaneItem()
          return activeItem && activeItem.getPath() === '/notes/open.txt'
        })
        runs(() => {
          // select same note
          buses.selectedPathP.push('/notes/open.txt')
          buses.selectedContentP.push('already open but not active')
          buses.searchRegexP.push(null)
          advanceClock(1000)
          expect(atom.workspace.getPaneItems().length).toEqual(1) // should not open any preview

          // select another note
          buses.selectedPathP.push('/notes/open2.txt')
          buses.selectedContentP.push('another file')
          advanceClock(1000)
        })
        waitsFor(() => {
          const activeItem = atom.workspace.getActivePaneItem()
          return activeItem && activeItem.getPath() === '/notes/open2.txt'
        })
        runs(() => {
          // select already open file again
          buses.selectedPathP.push('/notes/open.txt')
          buses.selectedContentP.push('already open but not active')
          advanceClock(1000)
          expect(atom.workspace.getActivePaneItem().getPath()).toMatch(/open.txt$/)
          expect(atom.workspace.getPaneItems().length).toEqual(1) // closed preview
        })
      })
    })
  })

  describe('when open stream yields an event', function () {
    describe('when there is a selected path', function () {
      beforeEach(function () {
        // preview
        buses.selectedPathP.push('/notes/file.txt')
        buses.selectedContentP.push('this should open a preview first')
        buses.searchRegexP.push(null)
        buses.newPathP.push('a-new-file')
        advanceClock(1000)
        waitsFor(() => {
          return atom.workspace.getPaneItems().length === 1 // wait for the preview
        })
        runs(() => {
          buses.openPathS.push(null)
        })
      })

      it('should replace preview with a normal text editor for file', function () {
        expect(atom.workspace.open).toHaveBeenCalledWith('/notes/file.txt')
        waitsFor(() => {
          return atom.workspace.getPaneItems().length === 1 // wait for the editor to open
        })
        runs(() => {
          expect(atom.workspace.getPaneItems().length).toEqual(1) // should have closed preview
        })
      })
    })

    describe('when there is no selected path', function () {
      beforeEach(function () {
        // preview
        buses.selectedPathP.push(null)
        buses.selectedContentP.push(null)
        buses.searchRegexP.push(null)
        buses.newPathP.push('/notes/a-new-file.txt')
        buses.openPathS.push(null)
      })

      it('should open a new text editor for path representing search query', function () {
        expect(atom.workspace.open).toHaveBeenCalledWith('/notes/a-new-file.txt')
        waitsFor(() => {
          return atom.workspace.getPaneItems().length === 1 // wait for the editor to open
        })
        runs(() => {
          expect(atom.workspace.getPaneItems().length).toEqual(1) // should have closed preview
        })
      })
    })
  })

  describe('when preview is clicked', function () {
    beforeEach(function () {
      // preview
      buses.selectedPathP.push('/notes/file.txt')
      buses.selectedContentP.push('this should open a preview first')
      buses.newPathP.push('/notes/fil.md')
      buses.searchRegexP.push(null)
      advanceClock(1000)
      waitsFor(() => {
        return atom.workspace.getPaneItems().length === 1 // wait for the preview
      })
      runs(() => {
        atom.workspace.getPaneItems()[0].click()
      })
    })

    it('should replace preview with a normal text editor for file', function () {
      expect(atom.workspace.open).toHaveBeenCalledWith('/notes/file.txt')
      waitsFor(() => {
        return atom.workspace.getPaneItems().length === 1 // wait for the editor to open
      })
      runs(() => {
        expect(atom.workspace.getPaneItems().length).toEqual(1) // should have closed preview
      })
    })
  })

  describe('when columns change', function () {
    beforeEach(function () {
      atom.config.setSchema('textual-velocity', {
        type: 'object',
        properties: defaultConfig
      })
      buses.columnsP.push([
        {title: 'Name', sortField: 'name'},
        {title: 'Tags', sortField: 'tags'}
      ])
    })

    it('should update config schema', function () {
      expect(atom.config.getSchema('textual-velocity.sortField')).toEqual(
        jasmine.objectContaining({
          type: 'string',
          default: 'name',
          enum: [
            {value: 'name', description: 'Name'},
            {value: 'tags', description: 'Tags'}
          ]
        }))
    })
  })
})
