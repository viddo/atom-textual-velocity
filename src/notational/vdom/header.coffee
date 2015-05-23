h = require 'virtual-dom/h'
th = require './th.coffee'
columns = require '../columns.coffee'

module.exports = ->
  h 'div.header',
    h 'table',
      h 'thead',
        h 'tr', columns.map ({width, title}) ->
          th width, title
