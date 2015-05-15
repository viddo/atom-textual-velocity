Bacon = require('baconjs')
moment = require('moment')
h = require('virtual-dom/h')
Path = require('path')

module.exports = [
  {
    title: 'Name'
    width: 60
    cellContent: (item) ->
      pieces = item.relPath.split(Path.sep)
      [
        h 'span.text-subtle', [
          pieces.slice(0, -1).join(Path.sep)
          Path.sep
        ] if pieces.length > 1
        pieces.slice(-1)
      ]
  },{
    title: 'Date created'
    width: 20
    cellContent: (item) -> moment(item.stats.birthtime).fromNow()
  },{
    title: 'Date modified'
    width: 20
    cellContent: (item) -> moment(item.stats.mtime).fromNow()
  }
]
