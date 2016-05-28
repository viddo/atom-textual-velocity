'use babel'
/* global CustomEvent */

import Path from 'path'
import fixUnbalancedConsoleGroups from './fix-unbalanced-console.groups'

describe('textual-velocity main', () => {
  let workspaceElement, activationError

  fixUnbalancedConsoleGroups()

  beforeEach(() => {
    spyOn(console, 'log').andCallThrough()
    atom.config.set('textual-velocity.contextDesc', 'main integration test')
    atom.config.set('textual-velocity.path', __dirname) // ./spec

    activationError = null
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    // Spy on fatal notifications to extract activationErroror, to re-throw it here
    spyOn(atom.notifications, 'addFatalError').andCallFake((msg, d) => {
      activationError = new Error([msg, d.detail, d.stack].join('\n')) // eslint-disable-line
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
      expect(panels[0].getItem().querySelector('.textual-velocity')).toEqual(jasmine.any(HTMLElement))
    })

    describe('when files are loaded', function () {
      beforeEach(function () {
        waitsFor(() => {
          return console.groupEnd.calls.length >= 1
        })
      })

      it('should preview files until contents and metadata are loaded', function () {
        let panels = atom.workspace.getTopPanels()
        expect(panels[0].getItem().innerHTML).toContain(__filename)
      })
    })
  })
})
