/* @flow */

import Bacon from 'baconjs'
import SideEffects from '../lib/side-effects'
import ReactView from '../lib/react-view'
import defaultConfig from '../lib/default-config'

describe('side-effects', function () {
  // eslint-disable-next-line
  let workspaceElement, buses, panel, sideEffects, view, presenter, spies, input

  const assertTextInputFocus = () => {
    expect(input.select).not.toHaveBeenCalled()
    advanceClock(1000)
    expect(input.select).toHaveBeenCalled()
    expect(input.focus).toHaveBeenCalled()
    expect(panel.getItem().querySelector).toHaveBeenCalledWith('input')
  }

  beforeEach(function () {
    atom.config.set('textual-velocity.listHeight', 123)
    spyOn(atom.workspace, 'open')

    buses = {
      columnHeaders: new Bacon.Bus(),
      forcedScrollTop: new Bacon.Bus(),
      itemsCount: new Bacon.Bus(),
      loading: new Bacon.Bus(),
      openPath: new Bacon.Bus(),
      pagination: new Bacon.Bus(),
      saveEditedCellContent: new Bacon.Bus(),
      previewItem: new Bacon.Bus(),
      rowHeight: new Bacon.Bus(),
      rows: new Bacon.Bus(),
      searchStr: new Bacon.Bus(),
      sort: new Bacon.Bus(),

      clickedRow: new Bacon.Bus(),
      keyDown: new Bacon.Bus(),
      keyInput: new Bacon.Bus(),
      listHeight: new Bacon.Bus(),
      sortDirection: new Bacon.Bus(),
      sortField: new Bacon.Bus(),
      scrollTop: new Bacon.Bus(),

      columnsProp: new Bacon.Bus(),
      editCellStream: new Bacon.Bus(),
      fieldsProp: new Bacon.Bus(),
      fileReadersProp: new Bacon.Bus(),
      fileWritersProp: new Bacon.Bus()
    }

    const testColumn: ColumnHeaderType = {
      id: 'test',
      sortField: 'name',
      title: 'Test column',
      width: 100
    }

    presenter = {
      columnHeadersProp: buses.columnHeaders.toProperty([testColumn]),
      forcedScrollTopProp: buses.forcedScrollTop.toProperty(undefined),
      itemsCountProp: buses.itemsCount.toProperty(),
      listHeightProp: buses.listHeight.toProperty(100),
      loadingStream: buses.loading,
      openPathStream: buses.openPath,
      paginationProp: buses.pagination.toProperty({start: 0, limit: 0}),
      saveEditedCellContentStream: buses.saveEditedCellContent,
      selectedPathStream: buses.previewItem,
      rowHeightProp: buses.rowHeight.toProperty(20),
      rowsStream: buses.rows.toProperty(),
      searchStrProp: buses.searchStr.toProperty(),
      sortProp: buses.sort.toProperty()
    }

    view = new ReactView(panel)
    view.clickedCellStream = buses.clickedRow
    view.keyDownStream = buses.keyDown
    view.listHeightStream = buses.listHeight
    view.sortDirectionStream = buses.sortDirection
    view.sortFieldStream = buses.sortField
    view.scrollTopStream = buses.scrollTop
    view.textInputStream = buses.keyInput
    spyOn(view, 'renderLoading')
    spyOn(view, 'renderResults')

    panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })
    spyOn(panel.getItem(), 'querySelector')

    const service = {
      columnsProp: buses.columnsProp,
      editCellStream: buses.editCellStream,
      fieldsProp: buses.fieldsProp,
      fileReadersProp: buses.fileReadersProp,
      fileWritersProp: buses.fileWritersProp
    }

    sideEffects = new SideEffects(panel, view, presenter, service)

    spies = {
      listHeight: jasmine.createSpy('listHeight'),
      rowHeight: jasmine.createSpy('rowHeight'),
      sortDirection: jasmine.createSpy('sortDirection'),
      sortField: jasmine.createSpy('sortField')
    }

    atom.config.observe('textual-velocity.listHeight', spies.listHeight)
    atom.config.observe('textual-velocity.rowHeight', spies.rowHeight)
    atom.config.observe('textual-velocity.sortDirection', spies.sortDirection)
    atom.config.observe('textual-velocity.sortField', spies.sortField)

    spies.listHeight.reset()
    spies.rowHeight.reset()
    spies.sortDirection.reset()
    spies.sortField.reset()

    input = jasmine.createSpyObj('input', ['select', 'focus'])
    panel.getItem().querySelector.andReturn(input)
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)
  })

  afterEach(function () {
    sideEffects.dispose()
  })

  it('should save list height when it changes', function () {
    buses.listHeight.push(120)
    buses.listHeight.push(123)
    buses.listHeight.push(124)
    expect(spies.listHeight).not.toHaveBeenCalled()
    advanceClock(1000)
    expect(spies.listHeight).toHaveBeenCalledWith(124)
    expect(spies.listHeight.calls.length).toEqual(1)
  })

  it('should save sort direction when changed', function () {
    buses.sortDirection.push('asc')
    expect(spies.sortDirection).toHaveBeenCalled()
  })

  it('should save sort field when changed', function () {
    buses.sortField.push('asc')
    expect(spies.sortField).toHaveBeenCalled()
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
      expect(spies.rowHeight).not.toHaveBeenCalled()
      advanceClock(1000)
      expect(spies.rowHeight).toHaveBeenCalledWith(28)
      expect(panel.getItem().querySelector).toHaveBeenCalledWith('td')
    })

    it('should not break if there is no td', function () {
      spies.rowHeight.reset()
      panel.getItem().querySelector.andReturn(undefined)
      triggerResizeEvent()
      advanceClock(1000)
      expect(spies.rowHeight).not.toHaveBeenCalled()
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

  describe('when loading stream yields a value', function () {
    beforeEach(function () {
      buses.loading.push()
    })

    it('should render loading', function () {
      expect(view.renderLoading).toHaveBeenCalledWith(100)
    })
  })

  describe('when presentation data yields values', function () {
    beforeEach(function () {
      // initial values related to initial search
      buses.searchStr.push('')
      buses.itemsCount.push(0)
      buses.sort.push({field: 'name', direction: 'desc'})
    })

    // Test values in sequence since interrelated
    it('should render on some yielded values', function () {
      expect(view.renderResults).not.toHaveBeenCalledWith()

      // render on rows
      buses.rows.push([])
      expect(view.renderResults).toHaveBeenCalledWith(jasmine.any(Object))

      // do NOT render on the others
      view.renderResults.reset()
      atom.config.set('textual-velocity.rowHeight', 20)
      buses.itemsCount.push(23)
      buses.rowHeight.push(20)
      buses.searchStr.push('beep')
      buses.sort.push({field: 'content', direction: 'asc'})
      expect(view.renderResults).not.toHaveBeenCalled()

      // render on scroll
      view.renderResults.reset()
      buses.forcedScrollTop.push(42)
      expect(view.renderResults).toHaveBeenCalled()

      // render on list height
      view.renderResults.reset()
      buses.listHeight.push(100)
      expect(view.renderResults).toHaveBeenCalled()
    })
  })

  describe('when preview stream yields a path', function () {
    beforeEach(function () {
      buses.previewItem.push('/notes/file.txt')
    })

    it('should preview the file using a pending text editor', function () {
      expect(atom.workspace.open).not.toHaveBeenCalled()
      advanceClock(1000)
      expect(atom.workspace.open).toHaveBeenCalled()
      expect(atom.workspace.open.mostRecentCall.args[0]).toEqual('/notes/file.txt')
      expect(atom.workspace.open.mostRecentCall.args[1].pending).toBe(true)
      expect(atom.workspace.open.mostRecentCall.args[1].activatePane).toBe(false)
    })
  })

  describe('when open stream yields a path', function () {
    beforeEach(function () {
      buses.openPath.push('/notes/file.txt')
    })

    it('should open text editor for file', function () {
      expect(atom.workspace.open).toHaveBeenCalledWith('/notes/file.txt')
    })
  })

  describe('when columns change', function () {
    beforeEach(function () {
      atom.config.setSchema('textual-velocity', {
        type: 'object',
        properties: defaultConfig
      })
      buses.columnsProp.push([
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