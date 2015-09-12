Bacon    = require 'baconjs'
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
    search = search({
      focusStream: focusBus
    })

    @projects = new Projects(search.inputTextStream)

    items = items(
      matchedItemsProp : @projects.matchedItemsProp
      columnsProp      : Bacon.sequentially(0, [columns]).toProperty([])
      focusBus         : focusBus
      searchStream     : search.inputTextStream
      selectPrevStream : search.selectPrevStream
      selectNextStream : search.selectNextStream
      bodyHeightStream : atoms.fromConfig('atom-notational.bodyHeight')
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
