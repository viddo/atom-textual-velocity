h = require 'virtual-dom/h'
th = require './th.coffee'
columns = require '../columns.coffee'
{ mouseMoveDiff } = require '../observables/dom.coffee'

module.exports = (scrollableContent, bodyHeight, {searchBus, bodyHeightBus}) ->
  h 'div.atom-notational', [
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

    scrollableContent

    h 'div.resize-handle', {
      onmousedown: (ev) ->
        mouseMoveDiff(ev).onValue (diff) ->
          bodyHeightBus.push bodyHeight + diff.clientY
    }
  ]
