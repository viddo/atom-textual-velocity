/* @flow */

import Bacon from 'baconjs'
import SideEffects from '../lib/side-effects'
import ViewCtrl from '../lib/view-ctrl'
import defaultConfig from '../lib/default-config'

describe('side-effects', function () {
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
    spyOn(atom.workspace, 'open')

    buses = {
      columnHeadersP: new Bacon.Bus(),
      forcedScrollTopP: new Bacon.Bus(),
      itemsCountP: new Bacon.Bus(),
      listHeightS: new Bacon.Bus(),
      loadingProgressP: new Bacon.Bus(),
      loadingS: new Bacon.Bus(),
      openPathS: new Bacon.Bus(),
      paginationP: new Bacon.Bus(),
      saveEditedCellContentS: new Bacon.Bus(),
      previewItemS: new Bacon.Bus(),
      rowHeightP: new Bacon.Bus(),
      rowsS: new Bacon.Bus(),
      searchStrP: new Bacon.Bus(),
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
      openPathS: buses.openPathS,
      paginationP: buses.paginationP.toProperty({start: 0, limit: 0}),
      saveEditedCellContentS: buses.saveEditedCellContentS,
      selectedPathS: buses.previewItemS,
      rowHeightP: buses.rowHeightP.toProperty(20),
      rowsS: buses.rowsS,
      searchStrP: buses.searchStrP.toProperty(),
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

  describe('when preview stream yields a path', function () {
    beforeEach(function () {
      buses.previewItemS.push('/notes/file.txt')
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
      buses.openPathS.push('/notes/file.txt')
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
