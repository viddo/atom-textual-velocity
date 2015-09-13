describe 'atom-notational', ->
  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage('atom-notational')

  it 'opens a panel', ->
   topPanels = atom.workspace.getTopPanels()
   expect(topPanels.length).toEqual(2)
   expect(topPanels[0].getItem().className).toContain('atom-notational-search')
   expect(topPanels[1].getItem().className).toContain('atom-notational-items')

  describe 'when package is desactivated', ->
    beforeEach ->
      atom.packages.deactivatePackage('atom-notational')

    it 'removes the top panels', ->
     topPanels = atom.workspace.getTopPanels()
     expect(topPanels).toEqual([])
