Bacon   = require 'baconjs'
Window   = require '../../src/notational/window'
columns = require '../../src/atom/columns'

describe 'Panel', ->
  beforeEach ->
    @searchBus       = new Bacon.Bus()
    @matchedItemsBus = new Bacon.Bus()
    @bodyHeightBus   = new Bacon.Bus()
    @rowHeightBus    = new Bacon.Bus()
    @columnsBus      = new Bacon.Bus()

    @nw = new Window(
      searchBus        : @searchBus
      matchedItemsProp : @matchedItemsBus.toProperty([])
      columnsProp      : @columnsBus.toProperty([])
      bodyHeightStream : @bodyHeightBus
      rowHeightStream  : @rowHeightBus
    )

  it 'has a set of expected attrs', ->
    expect(@nw.elementProp).toBeDefined()
    expect(@nw.resizedBodyHeightProp).toBeDefined()
    expect(@nw.selectedItemProp).toBeDefined()
    expect(@nw.openSelectedStream).toBeDefined()
    expect(@nw.hideStream).toBeDefined()

  describe 'when have some columns', ->
    beforeEach ->
      @elementSpy = jasmine.createSpy('el')
      @nw.elementProp.onValue(@elementSpy)
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
