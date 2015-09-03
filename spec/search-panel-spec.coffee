Bacon       = require 'baconjs'
SearchPanel = require '../src/search-panel'

describe 'SearchPanel', ->
  beforeEach ->
    @focusBus  = new Bacon.Bus()
    @searchBus = new Bacon.Bus()
    @searchBusSpy = jasmine.createSpy('searchBus')
    @searchBus.onValue @searchBusSpy

    @p = new SearchPanel(
      focusBus  : @focusBus
      searchBus : @searchBus
    )
    @rootElSpy = jasmine.createSpy('element')
    @p.elementProp.onValue @rootElSpy
    @rootEl = @rootElSpy.mostRecentCall.args[0]
    @inputEl = @rootEl.querySelector('.search')

  afterEach ->
    @p.dispose()
    expect(@p.elementProp).toBeNull()

  it 'has a set of expected attrs', ->
    expect(@p.keyDownStreams).toBeDefined()
    expect(@rootEl).toBeDefined()

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
        @inputEl.value = 'foobar'
        expect(@inputEl.value).toEqual('foobar')
        @inputEl.onkeydown({keyCode: 27})

      it 'reset value on ESC', ->
        expect(@inputEl.value).toEqual('')

      it 'pushes an empty string', ->
        expect(@searchBusSpy.mostRecentCall.args[0]).toEqual('')

  describe '.keydownStreams', ->
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
            @p.keyDownStreams[key].onValue @["#{key}Spy"]
          @inputEl.onkeydown({keyCode: currentKeyCode})

        it 'gets an value on corresponding stream', ->
          expect(@["#{currentKey}Spy"]).toHaveBeenCalled()

        it 'do not push any value on other streams', ->
          for key, keyCode of keys
            if (keyCode isnt currentKeyCode)
              expect(@["#{key}Spy"]).not.toHaveBeenCalled()

    for currentKey, currentKeyCode of keys
      setupKeyTest(currentKey, currentKeyCode)
