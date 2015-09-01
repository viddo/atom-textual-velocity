Bacon         = require 'baconjs'
Path          = require 'path'
atoms         = require './src/atom/streams'
columns       = require './src/atom/columns'
Projects      = require './src/atom/projects'
AttachedPanel = require './src/atom/attached-panel'
Panel         = require './src/notational/panel'

module.exports =
  config:
    bodyHeight:
      type    : 'number'
      default : 200
      minimum : 0
    rowHeight:
      type    : 'number'
      default : 25
      minimum : 0


  activate: (state) ->
    searchBus = new Bacon.Bus()
    @projects = new Projects(searchBus)
    panel = new Panel(
      searchBus        : searchBus
      matchedItemsProp : @projects.matchedItemsProp
      columnsProp      : Bacon.sequentially(0, [columns]).toProperty([])
      rowHeightStream  : atoms.fromConfig('atom-notational.rowHeight')
      bodyHeightStream : atoms.fromConfig('atom-notational.bodyHeight')
    )
    @attachedPanel = new AttachedPanel(panel)

  deactivate: ->
    @projects.dispose()
    @projects = null
    @attachedPanel.dispose()
    @attachedPanel = null
