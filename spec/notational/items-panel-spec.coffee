Bacon      = require 'baconjs'
ItemsPanel = require '../../src/notational/items-panel'
columns    = require '../../src/integrations/atom/columns'

describe 'ItemsPanel', ->
  beforeEach ->
    @focusBus           = new Bacon.Bus()
    @searchBus          = new Bacon.Bus()
    @matchedItemsBus    = new Bacon.Bus()
    @bodyHeightBus      = new Bacon.Bus()
    @rowHeightBus       = new Bacon.Bus()
    @columnsBus         = new Bacon.Bus()
    @moveSelectedStream = new Bacon.Bus()

    @p = new ItemsPanel(
      focusBus         : @focusBus
      searchBus        : @searchBus
      matchedItemsProp : @matchedItemsBus.toProperty([])
      columnsProp      : @columnsBus.toProperty([])
      bodyHeightStream : @bodyHeightBus
      rowHeightStream  : @rowHeightBus
      moveSelectedStream: @moveSelectedStream
    )

  it 'has a set of expected attrs', ->
    expect(@p.elementProp).toBeDefined()
    expect(@p.resizedBodyHeightProp).toBeDefined()
    expect(@p.selectedItemProp).toBeDefined()

  describe 'when have some columns', ->
    beforeEach ->
      @elementSpy = jasmine.createSpy('el')
      @p.elementProp.onValue(@elementSpy)
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
