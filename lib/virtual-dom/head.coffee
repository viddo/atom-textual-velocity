h = require 'virtual-dom/h'
row = require './row'

module.exports = (data, buses) ->
  { rowHeight } = data

  return h 'div.trow', {
    style:
      height: "#{rowHeight}px"
  }, [
    h 'div.tcell.tcell-head', 'Name'
    h 'div.tcell.tcell-head', 'Date created'
    h 'div.tcell.tcell-head', 'Date modified'
  ]
