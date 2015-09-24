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
    @addStartSessionCmd()

  addStartSessionCmd: ->
    @startSessionCmd = atom.commands.add 'atom-workspace', 'atom-notational:start-session', => @startSession()

  startSession: ->
    @disposeAndRemove('startSessionCmd')

    @projects = new Projects()
    @panels = new Panels(
      notationalUI(
        searchBus        : @projects.searchBus
        matchedItemsProp : @projects.matchedItemsProp
        columnsProp      : Bacon.sequentially(0, [columns]).toProperty([])
        bodyHeightStream : atoms.fromConfig('atom-notational.bodyHeight')
      ))

    @stopSessionCmd = atom.commands.add 'atom-workspace', 'atom-notational:stop-session', =>
      # start over
      @stopSession()
      @addStartSessionCmd()

  stopSession: ->
    @disposeAndRemove(prop) for prop in ['stopSessionCmd', 'startSessionCmd', 'projects', 'panels']

  disposeAndRemove: (prop) ->
    this[prop]?.dispose()
    this[prop] = null

  deactivate: ->
    @stopSession()
    @disposeAndRemove('startSessionCmd')
