'use babel'
/* global CustomEvent */

describe('textualVelocity', () => {
  let [workspaceElement] = []

  beforeEach(() => {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)
  })

  it('package is lazy-loaded', () => {
    expect(atom.packages.isPackageLoaded('textualVelocity')).toBe(false)
    expect(atom.packages.isPackageActive('textualVelocity')).toBe(false)
  })

  describe('when start-session command is triggered', () => {
    let [promise] = []

    beforeEach(() => {
      promise = atom.packages.activatePackage('textualVelocity')
      workspaceElement.dispatchEvent(new CustomEvent('textualVelocity:start-session', {bubbles: true}))
      waitsForPromise(() => {
        return promise
      })
    })

    afterEach(() => {
      atom.packages.deactivatePackage('textualVelocity')
    })

    it('creates a top panel for the textualVelocity panel', () => {
      let panels = atom.workspace.getTopPanels()
      expect(panels.length).toEqual(1)
      expect(panels[0].getItem().querySelector('.textualVelocity-search')).toBeDefined()
      expect(panels[0].getItem().querySelector('.textualVelocity-items')).toBeDefined()
    })

    it('removes the start-session command', () => {
      expect(atom.commands.getSnapshot()['textualVelocity:start-session']).toBeUndefined()
    })

    it('adds a stop-session command', () => {
      expect(atom.commands.getSnapshot()['textualVelocity:stop-session']).toBeDefined()
    })

    describe('when stop-session command is triggered', () => {
      beforeEach(() => {
        workspaceElement.dispatchEvent(new CustomEvent('textualVelocity:stop-session', {bubbles: true}))
      })

      it('destroys the panels', () => {
        expect(atom.workspace.getTopPanels().length).toEqual(0)
      })

      it('adds a start-session command again', () => {
        expect(atom.commands.getSnapshot()['textualVelocity:start-session']).toBeDefined()
      })

      it('removes the stop-session command', () => {
        expect(atom.commands.getSnapshot()['textualVelocity:stop-session']).toBeUndefined()
      })
    })

    describe('when package is desactivated', () => {
      beforeEach(() => {
        atom.packages.deactivatePackage('textualVelocity')
      })

      it('removes the panels', () => {
        expect(atom.workspace.getTopPanels().length).toEqual(0)
      })
    })
  })
})
