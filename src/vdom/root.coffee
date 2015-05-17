h = require 'virtual-dom/h'
scrollableList = require './scrollable-list.coffee'
th = require './th.coffee'
{ mouseMoveDiff } = require '../observables/dom.coffee'

module.exports = (data, columns, buses) ->
  { items, reverseStripes, bodyHeight, selectedItem } = data
  { searchBus, bodyHeightBus, selectedItemBus } = buses

  return h 'div.atom-notational', [
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

    h 'div.header',
      h 'table',
        h 'thead',
          h 'tr', columns.map ({ width, title }) ->
            th width, title

    scrollableList data, buses,
      h 'table', [
        h 'thead.only-for-column-widths',
          h 'tr', columns.map ({ width }) ->
            th width
        h 'tbody', {
          className: 'is-reversed-stripes' if reverseStripes
        }, items.map (item) ->
          h 'tr', {
            className: 'is-selected' if item is selectedItem
            onclick: (ev) ->
              selectedItemBus.push(item)
          }, columns.map ({ cellContent }) ->
            h 'td', cellContent(item)
      ]
    h 'div.resize-handle', {
      onmousedown: (ev) ->
        mouseMoveDiff(ev).onValue (diff) ->
          bodyHeightBus.push bodyHeight + diff.clientY
    }
  ]
