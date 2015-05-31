describe 'atom-notational', ->
  describe 'when package is activated', ->
    beforeEach ->
      waitsForPromise ->
        atom.packages.activatePackage('atom-notational')

     it 'opens a panel when activated', ->
       topPanels = atom.workspace.getTopPanels()
       expect(topPanels.length).toEqual(1)
       expect(topPanels[0].getItem().className).toContain('atom-notational-panel')

    fdescribe 'when package is desactivated', ->
      beforeEach ->
        atom.packages.deactivatePackage('atom-notational')

      it 'removes the top panel', ->
       topPanels = atom.workspace.getTopPanels()
       expect(topPanels.length).toEqual(0)
