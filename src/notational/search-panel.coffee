Bacon         = require 'baconjs'
R             = require 'ramda'
h             = require 'virtual-dom/h'
createElement = require 'virtual-dom/create-element'
search        = require './vdom/search'

module.exports =
class SearchPanel

  constructor: ({focusBus, searchBus}) ->
    keydownBus = new Bacon.Bus()
    isKeyCode  = R.propEq('keyCode')
    @keyDownStreams   = {
      enter : keydownBus.filter isKeyCode(13)
      esc   : keydownBus.filter isKeyCode(27)
      up    : keydownBus.filter isKeyCode(38)
      down  : keydownBus.filter isKeyCode(40)
    }

    vdomTree = h 'div.atom-notational-panel', {}, search(searchBus, keydownBus)
    @elementProp = Bacon.update createElement(vdomTree),
      [focusBus], @focusOnSearchInput
      [@keyDownStreams.esc], @resetSearch

  focusOnSearchInput: (el, ...) ->
    el.querySelector('.search').focus()
    return el

  resetSearch: (el, ...)->
    el.querySelector('.search').value = ''
    searchBus.push('')
    return el

  dispose: ->
    @elementProp = null
