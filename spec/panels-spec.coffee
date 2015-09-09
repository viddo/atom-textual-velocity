Bacon = require 'baconjs'
Panels = require '../src/panels'

xdescribe 'Panels', ->
  beforeEach ->
    @searchElementBus = new Bacon.Bus()
    @enterKeyDownBus  = new Bacon.Bus()
    @escKeyDownBus    = new Bacon.Bus()

    @search = {
      elementProp: @searchElementBus.toProperty()
      keyDownStreams: {
        enter: @enterKeyDownBus
        esc: @escKeyDownBus
      }
    }

    @itemsElementBus  = new Bacon.Bus()
    @resizedBodyBus   = new Bacon.Bus()
    @selectedItemsBus = new Bacon.Bus()

    @items = {
      elementProp           : @itemsElementBus.toProperty()
      selectedItemProp      : @selectedItemsBus.toProperty()
      resizedBodyHeightProp : @resizedBodyBus.toProperty(123)
    }

    @p = new Panels(
      search : @search
      items  : @items
    )

  describe 'when the body height is resized', ->
    beforeEach ->
      spyOn(atom.config, 'set').andCallThrough()
      @resizedBodyBus.push(200)
      waitsFor ->

        atom.config.set.calls.length > 1

    it 'settings should be saved after a certain period', ->
      expect(atom.config.get('atom-notational.bodyHeight')).toEqual 200
