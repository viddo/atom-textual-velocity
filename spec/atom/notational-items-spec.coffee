Bacon           = require 'baconjs'
NotationalItems = require '../../src/atom/notational-items'

describe 'notational-items', ->
  beforeEach ->
    @searchBus = new Bacon.Bus()
    @addItemsBus = new Bacon.Bus()
    @removeItemsBus = new Bacon.Bus()
    @closeProjectsBus = new Bacon.Bus()
    @obj = new NotationalItems(
      searchStream        : @searchBus
      addItemsStream      : @addItemsBus
      removeItemsStream   : @removeItemsBus
      closeProjectsStream : @closeProjectsBus
    )

    @matchedItemsPropSpy = jasmine.createSpy('matchedItemsProp')
    @obj.matchedItemsProp.onValue @matchedItemsPropSpy
    @columnsPropSpy = jasmine.createSpy('columnsProp')
    @obj.columnsProp.onValue @columnsPropSpy

  it 'have expects props to create panel', ->
    expect(@matchedItemsPropSpy.calls[0].args[0]).toEqual([])
    expect(@columnsPropSpy.calls[0].args[0]).toEqual([])

  describe 'when items are added', ->
    beforeEach ->
      @items = []
      for i in [1..6]
        item = {
          projectPath: if i % 2 then 'a' else 'b'
          relPath: if i < 4 then "c#{i}" else "d#{i}"
        }
        @items.push item
        @addItemsBus.push item

    it 'concats new items to matched items prop', ->
      expect(@matchedItemsPropSpy.mostRecentCall.args[0]).toEqual @items
      expect(@matchedItemsPropSpy.mostRecentCall.args[0].length).toEqual 6

    describe 'when items are removed', ->
      beforeEach ->
        @removeItemsBus.push {relPath: 'c2'}
        @removeItemsBus.push {relPath: 'c3'}

      it 'removes the items', ->
        expect(@matchedItemsPropSpy.mostRecentCall.args[0]).toEqual @items.slice(0,1).concat(@items.slice(3))
        expect(@matchedItemsPropSpy.mostRecentCall.args[0].length).toEqual 4

    describe 'when a project is closed', ->
      beforeEach ->
        @closeProjectsBus.push {projectPath: 'a'}

      it 'removes all the items that belong to that path', ->
        expect(@matchedItemsPropSpy.mostRecentCall.args[0]).toEqual [@items[1], @items[3], @items[5]]

    describe 'when a search string is given', ->
      it 'filters out the items that matches string', ->
        @searchBus.push 'd'
        expect(@matchedItemsPropSpy.mostRecentCall.args[0]).toEqual @items.slice(3)
        @searchBus.push 'd4'
        expect(@matchedItemsPropSpy.mostRecentCall.args[0]).toEqual @items.slice(3,4)
