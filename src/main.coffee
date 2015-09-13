Bacon        = require 'baconjs'
atoms        = require './atom-streams'
columns      = require './columns'
Panels       = require './panels'
Projects     = require './projects'
notationalUI = require './notational/ui'

module.exports =
  config:
    bodyHeight:
      type: 'number'
      default: 200
      minimum: 0

  activate: (state) ->
    @projects = new Projects()
    @panels = new Panels(
      notationalUI(
        searchBus        : @projects.searchBus
        matchedItemsProp : @projects.matchedItemsProp
        columnsProp      : Bacon.sequentially(0, [columns]).toProperty([])
        bodyHeightStream : atoms.fromConfig('atom-notational.bodyHeight')
      )
    )

  deactivate: ->
    @projects.dispose()
    @projects = null
    @panels.dispose()
    @panels = null
