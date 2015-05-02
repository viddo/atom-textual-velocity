h = require 'virtual-dom/h'
scrollableList = require './scrollable-list'
row = require './row'
th = require './th'

module.exports = (data, buses) ->
  { columns, items, reverseStripes } = data

  return h 'div.atom-notational', [
    h 'div', {
        className: 'block search'
      }, h 'input', {
          className: 'native-key-bindings input'
          type: 'text',
          placeholder: 'Search, or press enter to create a new untitled file'
          autocomplete: 'off'
        }

    h 'div.header',
      h 'table',
        h 'thead',
          h 'tr', columns.map ({ title, width }) ->
            th width, title

    scrollableList(data, buses,
      h 'table', [
        h 'thead.only-for-column-widths',
          h 'tr', columns.map ({ width }) ->
            th width
        h 'tbody', {
          className: 'is-reversed-stripes' if reverseStripes
        }, items.map (item) ->
          row item, data
      ]
    )
  ]
