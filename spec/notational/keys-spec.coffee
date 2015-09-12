Keys = require '../../src/notational/keys'

describe 'keys', ->
  describe '.isKey', ->
    it 'returns true if given event matches the defined code', ->
      esc = Keys.isKey('esc')
      expect(esc(keyCode: 27)).toBe(true)
      expect(esc(keyCode: -1)).toBe(false)
