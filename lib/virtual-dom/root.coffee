h = require 'virtual-dom/h'
head = require './head'
body = require './body'

module.exports = (data, buses) ->

  return h 'div.atom-notational', [
    h 'div', { className: 'block search' }, [
      h 'input', {
        className: 'native-key-bindings input'
        type: 'text',
        placeholder: 'Search, or press enter to create a new untitled file'
        autocomplete: 'off'
      }
    ]
    h 'div', [
      head(data, buses)
      body(data, buses)
    ]
  ]
