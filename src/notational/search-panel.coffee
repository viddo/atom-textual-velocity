Bacon         = require 'baconjs'
R             = require 'ramda'
createElement = require 'virtual-dom/create-element'
vDOM          = require './vdom'

module.exports =
class SearchPanel

  constructor: ({focusStream, searchBus}) ->
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
      [focusStream], R.tap @focusOnSearchInput
      [@keyDownStreams.esc], R.tap @resetSearch

  focusOnSearchInput: (el) ->
    el.querySelector('.search').focus()

  resetSearch: (el) =>
    el.querySelector('.search').value = ''
    @searchBus.push('')

  dispose: ->
    @elementProp = null
