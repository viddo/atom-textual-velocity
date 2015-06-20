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
      bodyHeightProp   : @bodyHeightBus.toProperty(100)
      rowHeightProp    : @rowHeightBus.toProperty(25)
      searchBus        : @searchBus
    })

  it 'creates a panel with a set of props and streams', ->
    expect(@panel.elementProp).toBeDefined()
    expect(@panel.resizedBodyHeightProp).toBeDefined()
    expect(@panel.selectedItemProp).toBeDefined()
    expect(@panel.openSelectedStream).toBeDefined()
    expect(@panel.hideStream).toBeDefined()
