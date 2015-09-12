Bacon         = require 'baconjs'
R             = require 'ramda'
createElement = require 'virtual-dom/create-element'
vDOM          = require './vdom'
keys          = require './keys'

module.exports = ({focusStream}) ->
  inputBus  = new Bacon.Bus()
  keyDownBus = new Bacon.Bus()
  abortStream = keyDownBus.filter keys.isEventCode('esc')

  vdomTree = vDOM.rootNode vDOM.search(inputBus, keyDownBus)
  elementProp = Bacon.update createElement(vdomTree),
    [focusStream], R.tap (el) ->
      el.querySelector('.search').focus()
    [abortStream], R.tap (el) =>
      el.querySelector('.search').value = ''

  preventDefault = R.invoker(0, 'preventDefault')

  inputValueStream = inputBus.map R.path(['target', 'value'])

  return {
    elementProp      : elementProp
    abortStream      : abortStream
    inputTextStream  : inputValueStream.merge abortStream.map('')
    openStream       : keyDownBus.filter keys.isEventCode('enter')
    selectPrevStream : keyDownBus.filter(keys.isEventCode('up')).doAction(preventDefault)
    selectNextStream : keyDownBus.filter(keys.isEventCode('down')).doAction(preventDefault)
  }
