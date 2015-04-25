h = require 'virtual-dom/h'
moment = require("moment")

module.exports = (item, data, buses) ->
  { title, dateCreated, dateModified } = item
  { rowHeight } = data

  return h 'div.trow', {
    style:
      height: "#{rowHeight}px"
  }, [
    h 'div.tcell', title
    h 'div.tcell', moment(dateCreated).fromNow()
    h 'div.tcell', moment(dateModified).fromNow()
  ]
