{Task} = require 'atom'
Bacon = require 'baconjs'
Path = require 'path'
atoms = require './src/atom/streams.coffee'
setupPanel = require './src/notational/setup-panel.coffee'

module.exports =
  panel: undefined
  deactivateBus: undefined
  subscriptions: []

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
    @deactivateBus = new Bacon.Bus()

    {addedStream, removedStream} = atoms.projectsPaths()

    watchedProjectsStream = addedStream.map (path) ->
      task = new Task(require.resolve('./src/atom/watch-project-task.coffee'))
      task.start(
        path,
        atom.config.get('core.ignoredNames'),
        atom.config.get('core.excludeVcsIgnoredPaths')
      )
      return {
        path: path
        task: task
      }

    projectsProp = atoms.projects(watchedProjectsStream, removedStream)

    addItemsStream = watchedProjectsStream.flatMap ({task}) ->
      Bacon.fromEvent(task, 'add')
    removeItemsStream = watchedProjectsStream.flatMap ({task}) ->
      Bacon.fromEvent(task, 'unlink')
    itemsProp = Bacon.update [],
      [addItemsStream], (items, newItem) ->
        items.concat(newItem)
      [removeItemsStream], (items, {relPath}) ->
        items.filter (item) ->
          item.relPath isnt relPath
      [removedStream], (items, removedPath) ->
        items.filter ({projectPath}) ->
          projectPath isnt removedPath

    moveSelectedStream = atoms.fromCommand('.atom-notational-search', 'core:move-down').map(1)
      .merge(atoms.fromCommand('.atom-notational-search', 'core:move-up').map(-1))

    {elementProp, resizedBodyHeightProp, unsubscribe} = setupPanel(
      itemsProp: itemsProp
      bodyHeightStream: atoms.fromConfig('atom-notational.bodyHeight')
      rowHeightStream: atoms.fromConfig('atom-notational.rowHeight')
      moveSelectedStream: moveSelectedStream
    )
    @_subscribe(unsubscribe)

    # Side effects
    # Create panel 1st time the element is created
    @_subscribe(
      elementProp.onValue (el) =>
        @panel = atom.workspace.addTopPanel(item: el) unless @panel
    )

    # Persist resized body height
    @_subscribe(
      resizedBodyHeightProp.debounce(500).onValue (newHeight) ->
        atom.config.set('atom-notational.bodyHeight', newHeight)
    )

    # Setup atom disose
    disposeProjectsProp = projectsProp.sampledBy(@deactivateBus)
    @_subscribe(
      disposeProjectsProp.onValue (projects) ->
        for {task} in projects
          task.send('dispose')
        return Bacon.noMore
    )


  _subscribe: (subscription) ->
    @subscriptions.push(subscription)

  deactivate: ->
    @deactivateBus.push(true)
    unsubscribe() for unsubscribe in @subscriptions
    @panel?.destroy()
