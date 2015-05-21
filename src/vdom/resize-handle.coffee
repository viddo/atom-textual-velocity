h = require 'virtual-dom/h'
{ mouseMoveDiff } = require '../observables/dom.coffee'

module.exports = (bodyHeight, bodyHeightBus) ->
  h 'div.resize-handle', {
    onmousedown: (ev) ->
      mouseMoveDiff(ev).onValue (diff) ->
        bodyHeightBus.push bodyHeight + diff.clientY
  }
