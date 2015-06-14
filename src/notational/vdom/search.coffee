h = require 'virtual-dom/h'

module.exports = (searchBus, keydownBus) ->
  h 'input', {
    type: 'text'
    tabIndex: '-1'
    className: 'search native-key-bindings'
    placeholder: 'Search, or press enter to create a new untitled file'
    onkeydown: (ev) ->
      keydownBus.push ev
    oninput: (ev) ->
      searchBus.push ev
  }
