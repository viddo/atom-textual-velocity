h = require 'virtual-dom/h'

module.exports = (searchBus, keyInputBus) ->
  h 'input', {
    type: 'text'
    tabIndex: '-1'
    className: 'search native-key-bindings'
    placeholder: 'Search, or press enter to create a new untitled file'
    onkeydown: (ev) ->
      keyInputBus.push ev
    oninput: (ev) ->
      searchBus.push @value
  }
