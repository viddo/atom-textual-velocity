NotationalItems = require '../../src/atom/notational-items'

describe 'notational-items', ->
  beforeEach ->
    @obj = new NotationalItems()

  afterEach ->
    @obj.dispose()

  it 'has required attrs to create panel', ->
    expect(@obj.matchedItemsProp).toBeDefined()
    expect(@obj.columnsProp).toBeDefined()
    expect(@obj.searchBus).toBeDefined()

  describe '.concatNewItem', ->
    it 'concats the 2nd arg with the 1st (an array) to yield a new array', ->
      expect(@obj.concatNewItem([1,2], 3)).toEqual [1,2,3]
