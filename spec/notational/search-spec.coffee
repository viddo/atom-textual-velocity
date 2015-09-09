Bacon  = require 'baconjs'
search = require '../../src/notational/search'

describe 'Search', ->
  beforeEach ->
    @focusBus  = new Bacon.Bus()
    @searchBus = new Bacon.Bus()
    @searchBusSpy = jasmine.createSpy('searchBus')
    @searchBus.onValue @searchBusSpy

    @search = search(
      focusStream : @focusBus
      searchBus   : @searchBus
    )
    @rootElSpy = jasmine.createSpy('element')
    @search.elementProp.onValue @rootElSpy
    @$input = ->
      @rootElSpy.mostRecentCall.args[0].querySelector('.search')

  it 'has a set of expected attrs', ->
    expect(@search.keyDownStreams).toBeDefined()
    expect(@rootElSpy.mostRecentCall.args[0]).toBeDefined()

  describe 'when focus is triggered', ->
    beforeEach ->
      spyOn(HTMLElement.prototype, 'focus')
      @focusBus.push()
      waitsFor =>
        @rootElSpy.calls.length is 2

    it 'focus on the element', ->
      expect(HTMLElement.prototype.focus).toHaveBeenCalled()

    it 'should still have an element', ->
      expect(@rootElSpy.mostRecentCall.args[0]).toBeDefined

    describe 'when ESC key is pressed on input', ->
      beforeEach ->
        @$input().value = 'foobar'
        expect(@$input().value).toEqual('foobar')
        @$input().onkeydown({keyCode: 27})

      it 'reset value on ESC', ->
        expect(@$input().value).toEqual('')

      it 'pushes an empty string', ->
        expect(@searchBusSpy.mostRecentCall.args[0]).toEqual('')

  describe '.keyDownStreams', ->
    keys = {
      'enter' : 13
      'esc'   : 27
      'up'    : 38
      'down'  : 40
    }
    setupKeyTest = (currentKey, currentKeyCode) ->
      describe "when #{currentKey.toUpperCase()} is pressed on search input", ->
        beforeEach ->
          for key, keyCode of keys
            @["#{key}Spy"] = jasmine.createSpy(key)
            @search.keyDownStreams[key].onValue @["#{key}Spy"]
          @$input().onkeydown({keyCode: currentKeyCode})

        it 'gets an value on corresponding stream', ->
          expect(@["#{currentKey}Spy"]).toHaveBeenCalled()

        it 'do not push any value on other streams', ->
          for key, keyCode of keys
            if (keyCode isnt currentKeyCode)
              expect(@["#{key}Spy"]).not.toHaveBeenCalled()

    for currentKey, currentKeyCode of keys
      setupKeyTest(currentKey, currentKeyCode)
