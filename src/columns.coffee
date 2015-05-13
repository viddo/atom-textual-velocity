Bacon = require('baconjs')
moment = require('moment')

module.exports = [
  {
    title: 'Name'
    width: 60
    cellContent: (item) -> item.relPath
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
