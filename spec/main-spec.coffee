describe 'notational', ->
  [workspaceElement] = []

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

  it 'package is lazy-loaded', ->
    expect(atom.packages.isPackageLoaded('notational')).toBe(false)
    expect(atom.packages.isPackageActive('notational')).toBe(false)

  describe 'when start-session command is triggered', ->
    [promise] = []

    beforeEach ->
      promise = atom.packages.activatePackage('notational')
      workspaceElement.dispatchEvent(new CustomEvent('notational:start-session', bubbles: true))
      waitsForPromise ->
        promise

    it 'creates a top panel for the notational panel', ->
      panels = atom.workspace.getTopPanels()
      expect(panels.length).toEqual(1)
      expect(panels[0].getItem().querySelector('.notational-search')).toBeDefined()
      expect(panels[0].getItem().querySelector('.notational-items')).toBeDefined()

    it 'removes the start-session command', ->
      expect(atom.commands.getSnapshot()['notational:start-session']).toBeUndefined()

    it 'adds a stop-session command', ->
      expect(atom.commands.getSnapshot()['notational:stop-session']).toBeDefined()

    describe 'when stop-session command is triggered', ->
      beforeEach ->
        workspaceElement.dispatchEvent(new CustomEvent('notational:stop-session', bubbles: true))

      it 'destroys the panels', ->
        expect(atom.workspace.getTopPanels().length).toEqual(0)

      it 'adds a start-session command again', ->
        expect(atom.commands.getSnapshot()['notational:start-session']).toBeDefined()

      it 'removes the stop-session command', ->
        expect(atom.commands.getSnapshot()['notational:stop-session']).toBeUndefined()

    describe 'when package is desactivated', ->
      beforeEach ->
        atom.packages.deactivatePackage('notational')

      it 'removes the panels', ->
        expect(atom.workspace.getTopPanels().length).toEqual(0)
