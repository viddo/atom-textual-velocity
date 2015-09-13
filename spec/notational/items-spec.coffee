Bacon   = require 'baconjs'
u       = require '../utils'
items   = require '../../src/notational/items'
columns = require '../../src/columns'

describe 'Items', ->
  beforeEach ->
    @searchBus        = new Bacon.Bus()
    @matchedItemsBus  = new Bacon.Bus()
    @columnsBus       = new Bacon.Bus()
    @bodyHeightBus    = new Bacon.Bus()

    @items = items(
      searchBus        : @searchBus
      matchedItemsProp : @matchedItemsBus.toProperty([])
      columnsProp      : @columnsBus.toProperty([])
      bodyHeightStream : @bodyHeightBus
    )

    @searchBusSpy = jasmine.createSpy('inputTextStream')
    @searchBus.onValue(@searchBusSpy)

    @resetStreamSpy = jasmine.createSpy('resetStream')
    @items.resetStream.onValue(@resetStreamSpy)

    @openStreamSpy = jasmine.createSpy('openStream')
    @items.openStream.onValue(@openStreamSpy)

    # Side-effects are required for streams to be started
    @searchElementSpy = jasmine.createSpy('search DOM element')
    @items.searchElementProp.onValue @searchElementSpy
    @$searchInput = ->
      @searchElementSpy.mostRecentCall.args[0].querySelector('.search')

    @itemsElementSpy = jasmine.createSpy('items DOM element')
    @items.itemsElementProp.onValue @itemsElementSpy
    @$items = ->
      @itemsElementSpy.mostRecentCall.args[0]

  it 'has a set of expected attrs', ->
    expect(@items.searchElementProp).toBeDefined()
    expect(@items.itemsElementProp).toBeDefined()
    expect(@items.resizedBodyHeightProp).toBeDefined()
    expect(@items.selectedItemProp).toBeDefined()
    expect(@items.resetStream).toBeDefined()
    expect(@items.openStream).toBeDefined()

  it 'has DOM elements', ->
    expect(@searchElementSpy.mostRecentCall.args[0]).toBeDefined()

  describe 'when have some columns', ->
    beforeEach ->
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
      expect(@itemsElementSpy).toHaveBeenCalled()
      el = @itemsElementSpy.calls[0].args[0]
      expect(el.querySelector('th[text="head1"]')).toBeDefined()
      expect(el.querySelector('th[text="head2"]')).toBeDefined()
      expect(el.querySelector('th[text="head3"]')).toBeDefined()

  describe 'on click on items element', ->
    beforeEach ->
      spyOn(@$searchInput(), 'focus')
      u.dispatchEvent(@$items(), 'click')

    it 'focus on search input', ->
      # implicitly verifies that returned element is still an element too
      expect(@$searchInput().focus).toHaveBeenCalled()

  describe 'when a string is written on input', ->
    beforeEach ->
      @$searchInput().value = 'test'
      u.dispatchEvent(@$searchInput(), 'input')

      waitsFor ->
        @searchBusSpy.calls.length is 1

    it 'send text on the inputTextStream', ->
      expect(@searchBusSpy.mostRecentCall.args[0]).toEqual 'test'

    describe 'when ESC key is pressed on input', ->
      beforeEach ->
        u.dispatchKeyEvent @$searchInput(), {
          eventType: 'keydown'
          keyCode: 27
        }
        waitsFor ->
          @resetStreamSpy.calls.length is 1

      it 'reset value on ESC', ->
        expect(@$searchInput().value).toEqual('')

  describe 'when UP key is pressed on input', ->
    beforeEach ->
      @preventDefaultSpy = jasmine.createSpy('preventDefaultSpy')
      u.dispatchKeyEvent @$searchInput(), {
        eventType      : 'keydown'
        keyCode        : 38
        preventDefault : @preventDefaultSpy
      }

    it 'preventDefault action (to not displace cursor)', ->
      expect(@preventDefaultSpy).toHaveBeenCalled()

    it 'select prev item'

  describe 'when DOWN key is pressed on input', ->
    beforeEach ->
      @preventDefaultSpy = jasmine.createSpy('preventDefaultSpy')
      u.dispatchKeyEvent @$searchInput(), {
        eventType      : 'keydown'
        keyCode        : 40
        preventDefault : @preventDefaultSpy
      }

    it 'preventDefault action (to not displace cursor)', ->
      expect(@preventDefaultSpy).toHaveBeenCalled()

    it 'select next item'

  describe 'when ENTER key is pressed on input', ->
    beforeEach ->
      u.dispatchKeyEvent @$searchInput(), {
        eventType      : 'keydown'
        keyCode        : 13
      }
      waitsFor ->
        @openStreamSpy.calls.length is 1

    it 'sends an event on select-prev stream', ->
      expect(@openStreamSpy.mostRecentCall.args[0]).toBeDefined()
