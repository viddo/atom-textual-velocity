h = require 'virtual-dom/h'
th = require './th.coffee'
columns = require '../columns.coffee'

module.exports = ({reverseStripes, items, selectedItem}, selectItemBus) ->
  h 'table', [
    h 'thead.only-for-column-widths',
      h 'tr', columns.map ({width}) ->
        th width
    h 'tbody', {
      className: 'is-reversed-stripes' if reverseStripes
    }, items.map (item) ->
      h 'tr', {
        className: 'is-selected' if item is selectedItem
        onclick: (ev) ->
          selectItemBus.push(item)
      }, columns.map ({cellContent}) ->
        h 'td', cellContent(item)
  ]
