Path     = require 'path'
Bacon    = require 'baconjs'
R        = require 'ramda'
atoms    = require './atom-streams'
columns  = require './columns'
Panels   = require './panels'
Projects = require './projects'
search   = require './notational/search'
items    = require './notational/items'

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

    search = search(
      focusStream : focusBus
      searchBus   : searchBus
    )

    preventDefault = R.invoker(0, 'preventDefault')
    moveSelectedStream = search.keyDownStreams.up.doAction(preventDefault).map(-1)
      .merge(search.keyDownStreams.down.doAction(preventDefault).map(1))

    items = items(
      matchedItemsProp   : @projects.matchedItemsProp
      columnsProp        : Bacon.sequentially(0, [columns]).toProperty([])
      focusBus           : focusBus
      searchStream       : searchBus
      moveSelectedStream : moveSelectedStream
      bodyHeightStream   : atoms.fromConfig('atom-notational.bodyHeight')
    )

    @panels = new Panels(
      search : search
      items  : items
    )

  deactivate: ->
    @projects.dispose()
    @projects = null
    @panels.dispose()
    @panels = null
