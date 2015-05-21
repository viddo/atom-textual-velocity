h = require 'virtual-dom/h'

module.exports = (searchBus) ->
  h 'atom-text-editor', {
    className: 'atom-notational-search'
    attributes: #custom ones
      mini: 'true'
      'placeholder-text': 'Search, or press enter to create a new untitled file'
    onkeydown: (ev) ->
      setTimeout =>
        searchBus.push @model.getText()
      , 0
  }
