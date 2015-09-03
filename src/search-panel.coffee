Bacon         = require 'baconjs'
R             = require 'ramda'
createElement = require 'virtual-dom/create-element'
vDOM          = require './vdom'

module.exports =
class SearchPanel

  constructor: ({focusBus, searchBus}) ->
    @searchBus = searchBus
    keydownBus = new Bacon.Bus()
    isKeyCode  = R.propEq('keyCode')
    @keyDownStreams   = {
      enter : keydownBus.filter isKeyCode(13)
      esc   : keydownBus.filter isKeyCode(27)
      up    : keydownBus.filter isKeyCode(38)
      down  : keydownBus.filter isKeyCode(40)
    }

    vdomTree = vDOM.rootNode vDOM.search(searchBus, keydownBus)
    @elementProp = Bacon.update createElement(vdomTree),
      [focusBus], @focusOnSearchInput
      [@keyDownStreams.esc], @resetSearch

  focusOnSearchInput: (el, ...) ->
    el.querySelector('.search').focus()
    return el

  resetSearch: (el, ...) =>
    el.querySelector('.search').value = ''
    @searchBus.push('')
    return el

  dispose: ->
    @elementProp = null
