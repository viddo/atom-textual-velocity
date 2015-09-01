Bacon   = require 'baconjs'
Panel   = require '../../src/notational/panel'
columns = require '../../src/atom/columns'

describe 'Panel', ->
  beforeEach ->
    @itemsBus      = new Bacon.Bus()
    @bodyHeightBus = new Bacon.Bus()
    @rowHeightBus  = new Bacon.Bus()
    @columnsBus    = new Bacon.Bus()

    @panel = new Panel(
      itemsProp        : @itemsBus.toProperty([])
      columnsProp      : @columnsBus.toProperty([])
      bodyHeightStream : @bodyHeightBus
      rowHeightStream  : @rowHeightBus
    )

  it 'has a set of expected attrs', ->
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
