/* @flow */

import Bacon from 'baconjs'
import SideEffects from '../lib/side-effects'
import ReactView from '../lib/react-view'
import defaultConfig from '../lib/default-config'

describe('side-effects', function () {
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
      columnHeadersProp: new Bacon.Bus(),
      forcedScrollTopProp: new Bacon.Bus(),
      itemsCountProp: new Bacon.Bus(),
      loadingStream: new Bacon.Bus(),
      openPathStream: new Bacon.Bus(),
      paginationProp: new Bacon.Bus(),
      saveEditedCellContentStream: new Bacon.Bus(),
      previewItemStream: new Bacon.Bus(),
      rowHeightProp: new Bacon.Bus(),
      rowsStream: new Bacon.Bus(),
      searchStrProp: new Bacon.Bus(),
      sortProp: new Bacon.Bus(),

      clickedCellStream: new Bacon.Bus(),
      keyDownStream: new Bacon.Bus(),
      listHeightStream: new Bacon.Bus(),
      sortDirectionStream: new Bacon.Bus(),
      sortFieldStream: new Bacon.Bus(),
      scrollTopStream: new Bacon.Bus(),
      textInputStream: new Bacon.Bus(),

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
      columnHeadersProp: buses.columnHeadersProp.toProperty([testColumn]),
      forcedScrollTopProp: buses.forcedScrollTopProp.toProperty(undefined),
      itemsCountProp: buses.itemsCountProp.toProperty(),
      listHeightProp: buses.listHeightStream.toProperty(100),
      loadingStream: buses.loadingStream,
      openPathStream: buses.openPathStream,
      paginationProp: buses.paginationProp.toProperty({start: 0, limit: 0}),
      saveEditedCellContentStream: buses.saveEditedCellContentStream,
      selectedPathStream: buses.previewItemStream,
      rowHeightProp: buses.rowHeightProp.toProperty(20),
      rowsStream: buses.rowsStream.toProperty(),
      searchStrProp: buses.searchStrProp.toProperty(),
      sortProp: buses.sortProp.toProperty()
    }

    view = new ReactView(panel)
    view.clickedCellStream = buses.clickedCellStream
    view.keyDownStream = buses.keyDownStream
    view.listHeightStream = buses.listHeightStream
    view.sortDirectionStream = buses.sortDirectionStream
    view.sortFieldStream = buses.sortFieldStream
    view.scrollTopStream = buses.scrollTopStream
    view.textInputStream = buses.textInputStream
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
      listHeightStream: jasmine.createSpy('listHeight'),
      rowHeightProp: jasmine.createSpy('rowHeightProp'),
      sortDirectionStream: jasmine.createSpy('sortDirection'),
      sortFieldStream: jasmine.createSpy('sortField')
    }

    atom.config.observe('textual-velocity.listHeight', spies.listHeightStream)
    atom.config.observe('textual-velocity.rowHeight', spies.rowHeightProp)
    atom.config.observe('textual-velocity.sortDirection', spies.sortDirectionStream)
    atom.config.observe('textual-velocity.sortField', spies.sortFieldStream)

    spies.listHeightStream.reset()
    spies.rowHeightProp.reset()
    spies.sortDirectionStream.reset()
    spies.sortFieldStream.reset()

    input = jasmine.createSpyObj('input', ['select', 'focus'])
    panel.getItem().querySelector.andReturn(input)
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)
  })

  afterEach(function () {
    sideEffects.dispose()
  })

  it('should save list height when it changes', function () {
    buses.listHeightStream.push(120)
    buses.listHeightStream.push(123)
    buses.listHeightStream.push(124)
    expect(spies.listHeightStream).not.toHaveBeenCalled()
    advanceClock(1000)
    expect(spies.listHeightStream).toHaveBeenCalledWith(124)
    expect(spies.listHeightStream.calls.length).toEqual(1)
  })

  it('should save sortProp direction when changed', function () {
    buses.sortDirectionStream.push('asc')
    expect(spies.sortDirectionStream).toHaveBeenCalled()
  })

  it('should save sortProp field when changed', function () {
    buses.sortFieldStream.push('asc')
    expect(spies.sortFieldStream).toHaveBeenCalled()
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
      expect(spies.rowHeightProp).toHaveBeenCalledWith(28)

      advanceClock(1000)
      panel.getItem().querySelector.andReturn({clientHeight: 30})
      triggerResizeEvent()
      expect(spies.rowHeightProp).toHaveBeenCalledWith(30)
      expect(panel.getItem().querySelector).toHaveBeenCalledWith('td')
    })

    it('should not break if there is no td', function () {
      spies.rowHeightProp.reset()
      panel.getItem().querySelector.andReturn(undefined)
      triggerResizeEvent()
      advanceClock(1000)
      expect(spies.rowHeightProp).not.toHaveBeenCalled()
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

  describe('when loadingStream stream yields a value', function () {
    beforeEach(function () {
      buses.loadingStream.push()
    })

    it('should render loading', function () {
      expect(view.renderLoading).toHaveBeenCalledWith(100)
    })
  })

  describe('when presentation data yields values', function () {
    beforeEach(function () {
      // initial values related to initial search
      buses.searchStrProp.push('')
      buses.itemsCountProp.push(0)
      buses.sortProp.push({field: 'name', direction: 'desc'})
    })

    // Test values in sequence since interrelated
    it('should render on some yielded values', function () {
      expect(view.renderResults).not.toHaveBeenCalledWith()

      // render on rowsStream
      buses.rowsStream.push([])
      expect(view.renderResults).toHaveBeenCalledWith(jasmine.any(Object))

      // do NOT render on the others
      view.renderResults.reset()
      atom.config.set('textual-velocity.rowHeight', 20)
      buses.itemsCountProp.push(23)
      buses.rowHeightProp.push(20)
      buses.searchStrProp.push('beep')
      buses.sortProp.push({field: 'content', direction: 'asc'})
      expect(view.renderResults).not.toHaveBeenCalled()

      // render on scroll
      view.renderResults.reset()
      buses.forcedScrollTopProp.push(42)
      expect(view.renderResults).toHaveBeenCalled()

      // render on list height
      view.renderResults.reset()
      buses.listHeightStream.push(100)
      expect(view.renderResults).toHaveBeenCalled()
    })
  })

  describe('when preview stream yields a path', function () {
    beforeEach(function () {
      buses.previewItemStream.push('/notes/file.txt')
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
      buses.openPathStream.push('/notes/file.txt')
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
