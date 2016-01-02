watchProjectFolder = require '../lib/watch-project-folder'

describe 'watchProjectFolder', ->
  [emitSpy] = []

  beforeEach ->
    emitSpy = jasmine.createSpy('emit')
    watchProjectFolder(__dirname, ['main-spec.coffee'], true, emitSpy)
    waitsFor ->
      emitSpy.calls.length > 0

  it 'calls emit for each found match', ->
    expect(emitSpy).toHaveBeenCalled()
    expect(emitSpy.calls[0].args[0]).toEqual('add')
    expect(emitSpy.calls[0].args[1].path).toMatch(/.+/)
    expect(emitSpy.calls[0].args[1].preview).toMatch(/.+/)
    expect(emitSpy.calls[0].args[1].stat).toBeDefined()
