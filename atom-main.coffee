Bacon            = require 'baconjs'
Path             = require 'path'
atoms            = require './src/atom-streams'
columns          = require './src/integrations/atom/columns'
Projects         = require './src/integrations/atom/projects'
Panel            = require './src/integrations/atom/panel'
NotationalWindow = require './src/notational/window'

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
    notationalWindow = new NotationalWindow(
      searchBus        : searchBus
      matchedItemsProp : @projects.matchedItemsProp
      columnsProp      : Bacon.sequentially(0, [columns]).toProperty([])
      rowHeightStream  : atoms.fromConfig('atom-notational.rowHeight')
      bodyHeightStream : atoms.fromConfig('atom-notational.bodyHeight')
    )
    @panel = new Panel(notationalWindow)

  deactivate: ->
    @projects.dispose()
    @projects = null
    @panel.dispose()
    @panel = null
