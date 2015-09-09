Bacon   = require 'baconjs'
items   = require '../../src/notational/items'
columns = require '../../src/columns'

describe 'Items', ->
  beforeEach ->
    @matchedItemsBus    = new Bacon.Bus()
    @columnsBus         = new Bacon.Bus()
    @focusBus           = new Bacon.Bus()
    @searchBus          = new Bacon.Bus()
    @moveSelectedStream = new Bacon.Bus()
    @bodyHeightBus      = new Bacon.Bus()

    @items = items(
      matchedItemsProp   : @matchedItemsBus.toProperty([])
      columnsProp        : @columnsBus.toProperty([])
      focusBus           : @focusBus
      searchStream       : @searchBus
      moveSelectedStream : @moveSelectedStream
      bodyHeightStream   : @bodyHeightBus
    )

  it 'has a set of expected attrs', ->
    expect(@items.elementProp).toBeDefined()
    expect(@items.resizedBodyHeightProp).toBeDefined()
    expect(@items.selectedItemProp).toBeDefined()

  describe 'when have some columns', ->
    beforeEach ->
      @elementSpy = jasmine.createSpy('el')
      @items.elementProp.onValue(@elementSpy)
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
