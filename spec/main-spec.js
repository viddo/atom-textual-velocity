'use babel'
/* global CustomEvent */

import Path from 'path'

describe('textual-velocity package', () => {
  let workspaceElement, activationError

  beforeEach(() => {
    activationError = null
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    // Spy on fatal notifications to extract activationErroror, to re-throw it here
    spyOn(atom.notifications, 'addFatalError').andCallFake((msg, d) => {
      activationError = new Error([msg, d.detail, d.stack].join("\n")) // eslint-disable-line
    })

    atom.configDirPath = Path.join(__dirname, 'fixtures')
  })

  it('package is lazy-loaded', () => {
    expect(atom.packages.isPackageLoaded('textual-velocity')).toBe(false)
    expect(atom.packages.isPackageActive('textual-velocity')).toBe(false)
  })

  describe('when start-session command is triggered', () => {
    let [promise] = []

    beforeEach(() => {
      promise = atom.packages.activatePackage('textual-velocity')
      workspaceElement.dispatchEvent(new CustomEvent('textual-velocity:start-session', {bubbles: true}))
      waitsForPromise(() => {
        if (activationError) throw activationError
        return promise
      })
    })

    afterEach(() => {
      if (!activationError) {
        atom.packages.deactivatePackage('textual-velocity')
      }
    })

    it('creates a top panel for the session', () => {
      let panels = atom.workspace.getTopPanels()
      expect(panels.length).toEqual(1)
      expect(panels[0].getItem().querySelector('.textual-velocity-search')).toBeDefined()
      expect(panels[0].getItem().querySelector('.textual-velocity-items')).toBeDefined()
    })

    it('removes the start-session command', () => {
      expect(atom.commands.getSnapshot()['textual-velocity:start-session']).toBeUndefined()
    })

    it('adds a stop-session command', () => {
      expect(atom.commands.getSnapshot()['textual-velocity:stop-session']).toBeDefined()
    })

    describe('when stop-session command is triggered', () => {
      beforeEach(() => {
        if (!activationError) {
          workspaceElement.dispatchEvent(new CustomEvent('textual-velocity:stop-session', {bubbles: true}))
        }
      })

      it('destroys the panels', () => {
        expect(atom.workspace.getTopPanels().length).toEqual(0)
      })

      it('adds a start-session command again', () => {
        expect(atom.commands.getSnapshot()['textual-velocity:start-session']).toBeDefined()
      })

      it('removes the stop-session command', () => {
        expect(atom.commands.getSnapshot()['textual-velocity:stop-session']).toBeUndefined()
      })
    })

    describe('when package is desactivated', () => {
      beforeEach(() => {
        if (!activationError) {
          atom.packages.deactivatePackage('textual-velocity')
        }
      })

      it('removes the panels', () => {
        expect(atom.workspace.getTopPanels().length).toEqual(0)
      })
    })
  })
})
