{ Task } = require 'atom'
Bacon = require 'baconjs'
atoms = require './streams.coffee'
projects = require '../src/observables/projects.coffee'
vdomTree = require '../src/observables/vdom-tree.coffee'
rootNode = require '../src/observables/root-node.coffee'

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

    { addedStream, removedStream } = atoms.projectsPaths()

    watchedProjectsStream = addedStream.map (path) ->
      task = new Task(require.resolve('./watch-project-task.coffee'))
      task.start(
        path,
        atom.config.get('core.ignoredNames'),
        atom.config.get('core.excludeVcsIgnoredPaths')
      )
      return {
        path: path
        task: task
      }

    projectsProp = projects(watchedProjectsStream, removedStream)

    bodyHeightBus = new Bacon.Bus()
    selectedItemBus = new Bacon.Bus()

    rootNodeProp = rootNode vdomTree({
        bodyHeightStream: atoms.fromConfig('atom-notational.bodyHeight').merge(bodyHeightBus)
        rowHeightStream: atoms.fromConfig('atom-notational.rowHeight')
        removedProjectStream: removedStream
        addItemsStream: watchedProjectsStream.flatMap ({ task }) ->
          Bacon.fromEvent(task, 'add')
        removeItemsStream: watchedProjectsStream.flatMap ({ task }) ->
          Bacon.fromEvent(task, 'unlink')
      }, {
        scrollTopBus: new Bacon.Bus()
        searchBus: new Bacon.Bus()
        bodyHeightBus: bodyHeightBus
        selectedItemBus: selectedItemBus
      })


    # Side effects
    @subscriptions.push rootNodeProp.onValue (rootNode) =>
      unless @panel
        @panel = atom.workspace.addTopPanel {
          item: rootNode
        }

    @subscriptions.push bodyHeightBus.debounce(500).onValue (newHeight) ->
      atom.config.set('atom-notational.bodyHeight', newHeight)

    terminateProjectsProp = projectsProp.sampledBy(@deactivateBus)
    terminateProjectsProp.onValue (projects) ->
      for { task } in projects
        task.send('finish')
      return Bacon.noMore


  deactivate: ->
    @deactivateBus.push(true)
    unsubscribe() for unsubscribe in @subscriptions
    @panel?.destroy()
