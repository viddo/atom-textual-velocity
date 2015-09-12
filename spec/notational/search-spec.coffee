Bacon  = require 'baconjs'
u = require '../utils'
search = require '../../src/notational/search'

describe 'Search', ->
  beforeEach ->
    @focusBus  = new Bacon.Bus()

    @search = search(
      focusStream : @focusBus
    )

    @inputTextStreamSpy = jasmine.createSpy('inputTextStream')
    @search.inputTextStream.onValue(@inputTextStreamSpy)

    @abortStreamSpy = jasmine.createSpy('abortStream')
    @search.abortStream.onValue(@abortStreamSpy)

    @openStreamSpy = jasmine.createSpy('openStream')
    @search.openStream.onValue(@openStreamSpy)

    @selectPrevStreamSpy = jasmine.createSpy('selectPrevStream')
    @search.selectPrevStream.onValue(@selectPrevStreamSpy)
    @selectNextStreamSpy = jasmine.createSpy('selectNextStream')
    @search.selectNextStream.onValue(@selectNextStreamSpy)

    # Side-effects are required for streams to be started
    @rootElSpy = jasmine.createSpy('element')
    @search.elementProp.onValue @rootElSpy
    @$input = ->
      @rootElSpy.mostRecentCall.args[0].querySelector('.search')

  it 'has a set of expected attrs', ->
    expect(@search.inputTextStream).toBeDefined()
    expect(@search.selectPrevStream).toBeDefined()
    expect(@search.selectNextStream).toBeDefined()
    expect(@search.openStream).toBeDefined()
    expect(@rootElSpy.mostRecentCall.args[0]).toBeDefined()

  describe 'on a focus stream event', ->
    beforeEach ->
      spyOn(HTMLElement.prototype, 'focus')
      @focusBus.push()
      waitsFor =>
        @rootElSpy.calls.length is 2

    it 'focus on the element', ->
      expect(HTMLElement.prototype.focus).toHaveBeenCalled()

    it 'should still have an element', ->
      expect(@rootElSpy.mostRecentCall.args[0]).toBeDefined

  describe 'when a string is written on input', ->
    beforeEach ->
      @$input().value = 'test'
      u.dispatchEvent(@$input(), 'input')

      waitsFor ->
        @inputTextStreamSpy.calls.length is 1

    it 'send text on the inputTextStream', ->
      expect(@inputTextStreamSpy.mostRecentCall.args[0]).toEqual 'test'

    describe 'when ESC key is pressed on input', ->
      beforeEach ->
        u.dispatchKeyEvent @$input(), {
          eventType: 'keydown'
          keyCode: 27
        }
        waitsFor ->
          @abortStreamSpy.calls.length is 1

      it 'reset value on ESC', ->
        expect(@$input().value).toEqual('')

      it 'pushes an empty string on inputTextStream', ->
        expect(@inputTextStreamSpy.mostRecentCall.args[0]).toEqual ''

  describe 'when UP key is pressed on input', ->
    beforeEach ->
      @preventDefaultSpy = jasmine.createSpy('preventDefaultSpy')
      u.dispatchKeyEvent @$input(), {
        eventType      : 'keydown'
        keyCode        : 38
        preventDefault : @preventDefaultSpy
      }
      waitsFor ->
        @selectPrevStreamSpy.calls.length is 1

    it 'sends an event on select-prev stream', ->
      expect(@selectPrevStreamSpy.mostRecentCall.args[0]).toBeDefined()

    it 'preventDefault action (to not displace cursor)', ->
      expect(@preventDefaultSpy).toHaveBeenCalled()

  describe 'when DOWN key is pressed on input', ->
    beforeEach ->
      @preventDefaultSpy = jasmine.createSpy('preventDefaultSpy')
      u.dispatchKeyEvent @$input(), {
        eventType      : 'keydown'
        keyCode        : 40
        preventDefault : @preventDefaultSpy
      }
      waitsFor ->
        @selectNextStreamSpy.calls.length is 1

    it 'sends an event on select-prev stream', ->
      expect(@selectNextStreamSpy.mostRecentCall.args[0]).toBeDefined()

    it 'preventDefault action (to not displace cursor)', ->
      expect(@preventDefaultSpy).toHaveBeenCalled()

  describe 'when ENTER key is pressed on input', ->
    beforeEach ->
      u.dispatchKeyEvent @$input(), {
        eventType      : 'keydown'
        keyCode        : 13
      }
      waitsFor ->
        @openStreamSpy.calls.length is 1

    it 'sends an event on select-prev stream', ->
      expect(@openStreamSpy.mostRecentCall.args[0]).toBeDefined()
