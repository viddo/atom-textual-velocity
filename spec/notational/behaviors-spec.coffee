Beh = require '../../src/notational/behaviors'

describe 'Behaviors', ->

  describe '.isEven', ->
    it 'returns true if given number is even', ->
      expect(Beh.isEven(1)).toBe(false)
      expect(Beh.isEven(20)).toBe(true)

  describe '.lastArg', ->
    it 'returns the last argument in call', ->
      expect(Beh.lastArg(1,2,3)).toEqual(3)

  describe '.tapResultElement', ->
    describe 'when given a selector and tap fn', ->
      beforeEach ->
        @tapSpy = jasmine.createSpy('tap')
        @appendClassName = Beh.tapResultElement('.second', @tapSpy)

      it 'returns a unary function', ->
        expect(@appendClassName.length).toEqual 1

      describe 'when return function is called with an object that contains an element on the property "el"', ->
        beforeEach ->
          @el = document.createElement('div')
          @el.innerHTML = """
            <ul>
              <li class="first"></li>
              <li class="second"></li>
              <li class="third"></li>
            <ul>
          """
          @obj = {el: @el}
          @result = @appendClassName(@obj)

        it 'returns matching element', ->
          expect(@result).toEqual @obj

        it 'calls tap fn with given', ->
          expect(@tapSpy).toHaveBeenCalled()
          expect(@tapSpy).toHaveBeenCalledWith(@el.querySelector('.second'))

  describe '.preventDefault', ->
    beforeEach ->
      @ev = jasmine.createSpyObj('ev', ['preventDefault'])
      Beh.preventDefault(@ev)

    it 'calls preventDefault on obj', ->
      expect(@ev.preventDefault).toHaveBeenCalled()

  describe '.isEventKey', ->
    it 'returns true if given event has the defined code', ->
      esc = Beh.isEventKey('esc')
      expect(esc(keyCode: 27)).toBe(true)
      expect(esc(keyCode: -1)).toBe(false)

  describe '.itemForSelectOffset', ->
    beforeEach ->
      @items = [0,1,2,3,4]

    describe 'when offset is positive (i.e. "go down")', ->
      it 'gets first item when there is no selected item', ->
        expect(Beh.itemForSelectOffset(undefined, 1, @items)).toEqual(0)

      it 'gets next item but stops at last when there is a selected item', ->
        expect(Beh.itemForSelectOffset(0, 1, @items)).toEqual(1)
        expect(Beh.itemForSelectOffset(1, 1, @items)).toEqual(2)
        expect(Beh.itemForSelectOffset(3, 1, @items)).toEqual(4)
        expect(Beh.itemForSelectOffset(4, 1, @items)).toEqual(4)

    describe 'when offset is negative (i.e. "go up")', ->
      it 'gets last item when there is no selected item', ->
        expect(Beh.itemForSelectOffset(undefined, -1, @items)).toEqual(4)

      it 'gets prev item but stops at first when there is a selected item', ->
        expect(Beh.itemForSelectOffset(4, -1, @items)).toEqual(3)
        expect(Beh.itemForSelectOffset(3, -1, @items)).toEqual(2)
        expect(Beh.itemForSelectOffset(1, -1, @items)).toEqual(0)
        expect(Beh.itemForSelectOffset(0, -1, @items)).toEqual(0)

  describe '.adjustScrollTopForSelectedItem', ->
    describe 'when there is no selected item', ->
      it 'returns current scrollTop', ->
        expect(Beh.adjustScrollTopForSelectedItem(123, undefined)).toEqual(123)

    describe 'when there is a selected item', ->
      beforeEach ->
        @rowHeight = 10
        @bodyHeight = 25 # so covers 2 items (and half of a 3rd)
        @items = [0,1,2,3,4,5]
        @selectedItem = 3 # so scrollTop for item should be within [30,40]

      describe 'when selected item is located before viewport', ->
        it 'return adjusted scrollTop to have selected item at top of viewport', ->
          expect(Beh.adjustScrollTopForSelectedItem(0, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(15)
          expect(Beh.adjustScrollTopForSelectedItem(5, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(15)

      describe 'when selected item is located within viewport', ->
        it 'returns current scrollTop', ->
          expect(Beh.adjustScrollTopForSelectedItem(6, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(6)
          expect(Beh.adjustScrollTopForSelectedItem(15, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(15)
          expect(Beh.adjustScrollTopForSelectedItem(20, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(20)
          expect(Beh.adjustScrollTopForSelectedItem(29, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(29)
          expect(Beh.adjustScrollTopForSelectedItem(30, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(30)

      describe 'when selected item is located after viewport', ->
        it 'return adjusted scrollTop to have selected item at bottom of viewport', ->
          expect(Beh.adjustScrollTopForSelectedItem(31, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(30)
          expect(Beh.adjustScrollTopForSelectedItem(9000, @selectedItem, @items, @rowHeight, @bodyHeight)).toEqual(30)
