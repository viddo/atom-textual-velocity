Bacon = require 'baconjs'
createPanel = require '../../src/notational/create-panel'

describe 'create-panel', ->
  beforeEach ->
    @matchedItemsBus = new Bacon.Bus()
    @columnsBus      = new Bacon.Bus()
    @bodyHeightBus   = new Bacon.Bus()
    @rowHeightBus    = new Bacon.Bus()
    @searchBus       = new Bacon.Bus()

    @panel = createPanel({
      matchedItemsProp : @matchedItemsBus.toProperty([])
      columnsProp      : @columnsBus.toProperty([])
      rowHeightProp    : @rowHeightBus.toProperty(25)
      bodyHeightStream : @bodyHeightBus
      searchBus        : @searchBus
    })

  it 'creates a panel with a set of props and streams', ->
    expect(@panel.elementProp).toBeDefined()
    expect(@panel.resizedBodyHeightProp).toBeDefined()
    expect(@panel.selectedItemProp).toBeDefined()
    expect(@panel.openSelectedStream).toBeDefined()
    expect(@panel.hideStream).toBeDefined()

  describe 'when have some columns', ->
    beforeEach ->
      @elementSpy = jasmine.createSpy('el')
      @panel.elementProp.onValue(@elementSpy)
      @columnsBus.push [{
        title: 'head1'
        width: 45
        cellContent: ({a}) -> a
      }, {
        title: 'head2'
        width: 30
        cellContent: ({b}) -> b
      }, {
        title: 'head3'
        width: 25
        cellContent: ({c}) -> b
      }]

    it 'renders the columns as table headers', ->
      expect(@elementSpy).toHaveBeenCalled()
      el = @elementSpy.calls[0].args[0]
      expect(el.querySelector('th[text="head1"]')).toBeDefined()
      expect(el.querySelector('th[text="head2"]')).toBeDefined()
      expect(el.querySelector('th[text="head3"]')).toBeDefined()
