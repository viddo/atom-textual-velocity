h = require 'virtual-dom/h'
moment = require("moment")

module.exports = (item) ->
  { title, dateCreated, dateModified } = item

  return h 'tr', [
    h 'td', title
    h 'td', moment(dateCreated).fromNow()
    h 'td', moment(dateModified).fromNow()
  ]
