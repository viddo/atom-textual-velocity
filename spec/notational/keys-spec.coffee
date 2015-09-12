keys = require '../../src/notational/keys'

describe 'keys', ->
  describe '.isEventCode', ->
    it 'returns true if given event matches the defined code', ->
      esc = keys.isEventCode('esc')
      expect(esc(keyCode: 27)).toBe(true)
      expect(esc(keyCode: -1)).toBe(false)
