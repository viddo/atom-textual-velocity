Path        = require 'path'
Bacon       = require 'baconjs'
R           = require 'ramda'
ItemsPanel  = require './notational/items-panel'
SearchPanel = require './notational/search-panel'
atoms       = require './atom-streams'
columns     = require './columns'
Panels      = require './panels'
Projects    = require './projects'

module.exports =
  config:
    bodyHeight:
      type: 'number'
      default: 200
      minimum: 0

  activate: (state) ->
    focusBus  = new Bacon.Bus()
    searchBus = new Bacon.Bus()
    @projects = new Projects(searchBus)

    searchPanel = new SearchPanel(
      focusStream : focusBus
      searchBus   : searchBus
    )

    preventDefault = R.invoker(0, 'preventDefault')
    moveSelectedStream = searchPanel.keyDownStreams.up.doAction(preventDefault).map(-1)
      .merge(searchPanel.keyDownStreams.down.doAction(preventDefault).map(1))

    itemsPanel = new ItemsPanel(
      matchedItemsProp   : @projects.matchedItemsProp
      columnsProp        : Bacon.sequentially(0, [columns]).toProperty([])
      focusBus           : focusBus
      searchStream       : searchBus
      moveSelectedStream : moveSelectedStream
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
