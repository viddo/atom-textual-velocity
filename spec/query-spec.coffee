query = require '../lib/query'

describe 'query', ->
  [emitSpy, doneCallbackSpy] = []

  beforeEach ->
    emitSpy = jasmine.createSpy('emit')
    doneCallbackSpy = jasmine.createSpy('emit')
    query([__filename], 'query', emitSpy, doneCallbackSpy)
    waitsFor ->
      doneCallbackSpy.calls.length > 0

  it 'calls emit for found match', ->
    expect(emitSpy).toHaveBeenCalled()
    expect(emitSpy.calls[0].args[0]).toEqual('results')
    expect(emitSpy.calls[0].args[1].path).toMatch(/.+/)
    expect(emitSpy.calls[0].args[1].preview).toMatch(/.+/)
    expect(emitSpy.calls[0].args[1].stat).toBeDefined()

  it 'calls doneCallback when finished', ->
    expect(doneCallbackSpy).toHaveBeenCalled()
