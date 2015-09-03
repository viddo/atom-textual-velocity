Path        = require 'path'
Bacon       = require 'baconjs'
R           = require 'ramda'
atoms       = require './src/atom-streams'
SearchPanel = require './src/search-panel'
ItemsPanel  = require './src/items-panel'
columns     = require './src/integrations/atom/columns'
Projects    = require './src/integrations/atom/projects'
Panels      = require './src/integrations/atom/panels'

module.exports =
  config:
    bodyHeight:
      type: 'number'
      default: 200
      minimum: 0
    rowHeight:
      type: 'number'
      default: 25
      minimum: 0

  activate: (state) ->
    focusBus  = new Bacon.Bus()
    searchBus = new Bacon.Bus()
    @projects = new Projects(searchBus)

    searchPanel = new SearchPanel(
      focusBus  : focusBus
      searchBus : searchBus
    )

    preventDefault = R.invoker(0, 'preventDefault')
    moveSelectedStream = searchPanel.keyDownStreams.up.doAction(preventDefault).map(-1)
      .merge(searchPanel.keyDownStreams.down.doAction(preventDefault).map(1))

    itemsPanel = new ItemsPanel(
      focusBus           : focusBus
      searchBus          : searchBus
      matchedItemsProp   : @projects.matchedItemsProp
      moveSelectedStream : moveSelectedStream
      columnsProp        : Bacon.sequentially(0, [columns]).toProperty([])
      rowHeightStream    : atoms.fromConfig('atom-notational.rowHeight')
      bodyHeightStream   : atoms.fromConfig('atom-notational.bodyHeight')
    )

    @panels = new Panels(
      searchPanel : searchPanel
      itemsPanel  : itemsPanel
    )

  deactivate: ->
    @projects.dispose()
    @projects = null
    @panels.dispose()
    @panels = null
