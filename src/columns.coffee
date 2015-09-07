Bacon  = require 'baconjs'
moment = require 'moment'
h      = require 'virtual-dom/h'
Path   = require 'path'
R      = require 'ramda'

dateFromNow = R.pipe R.path(R.__), moment, R.invoker(0, 'fromNow')

module.exports = [
  {
    title: 'Name'
    width: 60
    cellContent: (item) ->
      pieces = item.relPath.split(Path.sep)
      [
        if pieces.length > 1
          h 'span.text-subtle', [
            pieces.slice(0, -1).join(Path.sep)
            Path.sep
          ]
        pieces.slice(-1)
      ]
  },{
    title: 'Date created'
    width: 20
    cellContent: dateFromNow(['stats' ,'birthtime'])
  },{
    title: 'Date modified'
    width: 20
    cellContent: dateFromNow(['stats' ,'mtime'])
  }
]
