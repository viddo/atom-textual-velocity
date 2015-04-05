h = require 'virtual-dom/h'

module.exports = () ->
  tree = h 'div.atom-notational', [
    h 'div', { className: 'block search' }, [
      h 'input.native-key-bindings', {
        type: 'text',
        placeholder: 'Search, or press enter to create a new untitled file'
        autocomplete: 'off'
      }
    ]
    h 'table', { className: 'block items' },[
      h 'thead', [
        h 'tr', [
          h 'th', 'Title'
          h 'th', 'Date added'
          h 'th', 'Date modified'
        ]
      ]
      h 'tbody', [1..1000].map (i) ->
        h 'tr', [
          h 'td', "foobar #{i}"
          h 'td', 'April 1, 2014 4:30PM PDT'
          h 'td', 'April 2, 2014 4:30PM PDT'
        ]
    ]
  ]

  return tree
