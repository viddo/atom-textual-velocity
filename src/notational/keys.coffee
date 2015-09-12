R = require 'ramda'

KEY_CODES = {
  ENTER : 13
  ESC   : 27
  UP    : 38
  DOWN  : 40
}

module.exports = {

  isEventCode: R.curry (keyName, ev) ->
    #isKeyCode: R.propEq('keyCode')
    ev.keyCode is KEY_CODES[keyName.toUpperCase()]
}
