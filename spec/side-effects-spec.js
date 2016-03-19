'use babel'

import Path from 'path'
import Bacon from 'baconjs'
import * as sideEffects from '../lib/side-effects'

const STANDARD_PATH = Path.join(__dirname, 'fixtures', 'standard')

describe('side-effects', () => {
  beforeEach(function () {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    this.atomPanel = atom.workspace.addTopPanel({
      item: document.createElement('div'),
      visible: false
    })
    spyOn(this.atomPanel, 'show').andCallThrough()
    spyOn(this.atomPanel, 'hide').andCallThrough()
  })

  afterEach(function () {
    this.atomPanel.destroy()
  })

  describe('.showPanel', function () {
    beforeEach(function () {
      this.focusCmdStream = new Bacon.Bus()
      sideEffects.showPanel(this.focusCmdStream, this.atomPanel)
    })

    it('shows panel when focusCmdStream triggers', function () {
      expect(this.atomPanel.isVisible()).toBeFalsy()

      this.focusCmdStream.push(true)
      expect(this.atomPanel.isVisible()).toBeTruthy()

      this.focusCmdStream.push(true)
      expect(this.atomPanel.isVisible()).toBeTruthy()
    })
  })

  describe('.togglePanel', function () {
    beforeEach(function () {
      this.togglePanelCmdStream = new Bacon.Bus()
      sideEffects.showPanel(this.togglePanelCmdStream, this.atomPanel)
    })

    it('toggles panel based on visible state', function () {
      expect(this.atomPanel.isVisible()).toBeFalsy()

      this.togglePanelCmdStream.push(true)
      expect(this.atomPanel.isVisible()).toBeTruthy()

      this.togglePanelCmdStream.push(true)
      expect(this.atomPanel.isVisible()).toBeTruthy()
    })
  })

  describe('.toggleAtomWindowAndPanel', function () {
    beforeEach(function () {
      spyOn(atom, 'hide')
      spyOn(atom, 'show')
      spyOn(atom, 'focus')
      spyOn(atom, 'getCurrentWindow').andCallThrough()
      spyOn(atom.getCurrentWindow(), 'isFocused')

      this.toggleAtomWinCmdStream = new Bacon.Bus()
      sideEffects.toggleAtomWindowAndPanel(this.toggleAtomWinCmdStream, this.atomPanel, atom)
    })

    describe('when window is focused', function () {
      beforeEach(function () {
        atom.getCurrentWindow().isFocused.andReturn(true)
      })

      it('hides atom if panel is visible', function () {
        this.atomPanel.show()
        this.toggleAtomWinCmdStream.push(true)

        expect(atom.hide).toHaveBeenCalled()
      })

      it('shows panel if it is hidden', function () {
        this.toggleAtomWinCmdStream.push(true)

        expect(this.atomPanel.isVisible()).toBeTruthy()
      })
    })

    describe('when window is inactive', function () {
      beforeEach(function () {
        atom.getCurrentWindow().isFocused.andReturn(false)
        this.toggleAtomWinCmdStream.push(true)
      })

      it('shows and focus atom', function () {
        expect(atom.show).toHaveBeenCalled()
        expect(atom.focus).toHaveBeenCalled()
      })

      it('shows atom panel', function () {
        expect(this.atomPanel.isVisible()).toBeTruthy()
      })
    })
  })

  describe('.updatePreview', function () {
    beforeEach(function () {
      jasmine.Clock.useMock()
      spyOn(atom.workspace, 'open').andCallThrough()

      this.selectedFileBus = new Bacon.Bus()
      const selectedFilePathProp = this.selectedFileBus.toProperty(null)
      sideEffects.updatePreview(selectedFilePathProp, atom.workspace)
    })

    it('does nothing since there is no selection yet', function () {
      expect(atom.workspace.open).not.toHaveBeenCalled()
    })

    describe('when there is a selected path', function () {
      beforeEach(function () {
        this.path = Path.join(atom.getConfigDirPath(), 'first.txt')
        this.selectedFileBus.push(this.path)
      })

      it('does nothing just yet', function () {
        expect(atom.workspace.open).not.toHaveBeenCalled()
      })

      describe('when debounced', function () {
        beforeEach(function () {
          let didOpen = false
          atom.workspace.onDidOpen(() => didOpen = true)
          jasmine.Clock.tick(1000)
          waitsFor(() => didOpen)
        })

        it('opens seleted file path', function () {
          expect(atom.workspace.open).toHaveBeenCalled()
          expect(atom.workspace.open.calls[0].args[0]).toMatch(/first.txt$/)
          expect(atom.workspace.getPaneItems()).not.toEqual([])
        })

        it('does not focus on the editor though', function () {
          expect(atom.workspace.open.calls[0].args[1].activatePane).toBe(false)
        })

        describe('when an item is deselected', function () {
          beforeEach(function () {
            this.selectedFileBus.push(null)
            jasmine.Clock.tick(1000)

            // on 2nd event there should not exist any editor, verified that no error is thrown
            this.selectedFileBus.push(null)
            jasmine.Clock.tick(1000)
          })

          it('should close the open text editor', function () {
            expect(atom.workspace.open.calls.length).toEqual(1)
            expect(atom.workspace.getPaneItems()).toEqual([])
          })
        })
      })
    })
  })

  describe('.openEditor', function () {
    let didOpen

    beforeEach(function () {
      spyOn(atom.workspace, 'open').andCallThrough()
      this.selectedPathBus = new Bacon.Bus()
      this.newFilePathBus = new Bacon.Bus()
      this.openBus = new Bacon.Bus()
      sideEffects.openEditor(this.selectedPathBus, this.newFilePathBus, this.openBus, atom.workspace)
      this.selectedPathBus.push(null)
      this.newFilePathBus.push('')

      didOpen = false
      atom.workspace.onDidOpen(() => {
        didOpen = true
      })
    })

    describe('when there is a selected path', function () {
      beforeEach(function () {
        this.selectedPathBus.push('selected-file')
        this.openBus.push(true)
        waitsFor(() => didOpen)
      })

      it('opens given path when open stream is triggered', function () {
        expect(atom.workspace.open).toHaveBeenCalled()
        expect(atom.workspace.open.calls[0].args[0]).toEqual('selected-file')
      })
    })

    describe('when there is no selected path', function () {
      beforeEach(function () {
        this.selectedPathBus.push(null)
        this.newFilePathBus.push('new-file')
        this.openBus.push(true)
        waitsFor(() => didOpen)
      })

      it('opens a new file', function () {
        expect(atom.workspace.open).toHaveBeenCalled()
        expect(atom.workspace.open.calls[0].args[0]).toEqual('new-file')
      })
    })
  })

  describe('.persistSortField', function () {
    beforeEach(function () {
      this.sortFieldBus = new Bacon.Bus()
      sideEffects.persistSortField(this.sortFieldBus.toProperty(), atom.config)
    })

    it('persists new value', function () {
      this.sortFieldBus.push('name')
      expect(atom.config.get('textual-velocity.sortField')).toEqual('name')
    })
  })

  describe('.persistSortDirection', function () {
    beforeEach(function () {
      this.sortDirectionBus = new Bacon.Bus()
      sideEffects.persistSortDirection(this.sortDirectionBus.toProperty(), atom.config)
    })

    it('persists new value', function () {
      this.sortDirectionBus.push('asc')
      expect(atom.config.get('textual-velocity.sortDirection')).toEqual('asc')
      this.sortDirectionBus.push('desc')
      expect(atom.config.get('textual-velocity.sortDirection')).toEqual('desc')
    })
  })

  describe('.persistPanelHeight', function () {
    beforeEach(function () {
      jasmine.Clock.useMock()
      this.panelHeightBus = new Bacon.Bus()
      sideEffects.persistPanelHeight(this.panelHeightBus.toProperty(), atom.config)
    })

    it('persists new value once debounced', function () {
      this.panelHeightBus.push(101)
      this.panelHeightBus.push(123)
      expect(atom.config.get('textual-velocity.panelHeight')).toBeUndefined()

      jasmine.Clock.tick(1000)
      expect(atom.config.get('textual-velocity.panelHeight')).toEqual(123)
    })
  })
})
