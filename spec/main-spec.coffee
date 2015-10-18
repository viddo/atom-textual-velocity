describe 'atom-notational', ->
  [workspaceElement] = []

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

  it 'package is lazy-loaded', ->
    expect(atom.packages.isPackageLoaded('atom-notational')).toBe(false)
    expect(atom.packages.isPackageActive('atom-notational')).toBe(false)

  describe 'when start-session command is triggered', ->
    [promise] = []

    beforeEach ->
      promise = atom.packages.activatePackage('atom-notational')
      workspaceElement.dispatchEvent(new CustomEvent('atom-notational:start-session', bubbles: true))
      waitsForPromise ->
        promise

    it 'creates a top panel for the notational panel', ->
      panels = atom.workspace.getTopPanels()
      expect(panels.length).toEqual(1)
      expect(panels[0].getItem().querySelector('.atom-notational-search')).toBeDefined()
      expect(panels[0].getItem().querySelector('.atom-notational-items')).toBeDefined()

    it 'start-session command is no longer available', ->
      expect(atom.commands.getSnapshot()['atom-notational:start-session']).toBeUndefined()

    it 'stop-session command is available', ->
      expect(atom.commands.getSnapshot()['atom-notational:stop-session']).toBeDefined()

    describe 'when stop-session command is triggered', ->
      beforeEach ->
        workspaceElement.dispatchEvent(new CustomEvent('atom-notational:stop-session', bubbles: true))

      it 'destroys the panels', ->
        expect(atom.workspace.getTopPanels().length).toEqual(0)

      it 'start-session command is available again', ->
        expect(atom.commands.getSnapshot()['atom-notational:start-session']).toBeDefined()

      it 'stop-session command is no longer available', ->
        expect(atom.commands.getSnapshot()['atom-notational:stop-session']).toBeUndefined()

    describe 'when package is desactivated', ->
      beforeEach ->
        atom.packages.deactivatePackage('atom-notational')

      it 'removes the panels', ->
        expect(atom.workspace.getTopPanels().length).toEqual(0)
