{ Task } = require('atom')
Bacon = require('baconjs')
createElement = require('virtual-dom/create-element')
diff = require('virtual-dom/diff')
patch = require('virtual-dom/patch')
atoms = require('./streams.coffee')
vdomTrees = require('../src/vdom-trees.coffee')

module.exports =
  panel: undefined
  rootNode: undefined
  deactivateStream: undefined

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
    @deactivateStream = new Bacon.Bus()
    scrollTopBus = new Bacon.Bus()
    bodyHeightBus = new Bacon.Bus()

    { addedStream, removedStream } = atoms.projectsPaths()
    watchedProjectsStream = addedStream.map (path) ->
      task = new Task(require.resolve('./watch-project-task.coffee'))
      task.start(path)
      return {
        path: path
        task: task
      }

    projectsProp = Bacon.update [],
      [watchedProjectsStream], (projects, project) ->
        projects.concat(project)
      [removedStream], (projects, removedPath) ->
        [removedProject] = projects.filter ({ path }) ->
          path is removedPath
        removedProject.task.send('finish') if removedProject
        projects.filter ({ path }) ->
          path isnt removedPath

    vdomTreesProp = vdomTrees {
      bodyHeightStream: atoms.fromConfig('atom-notational.bodyHeight').merge(bodyHeightBus)
      rowHeightStream: atoms.fromConfig 'atom-notational.rowHeight'
      removedStream: removedStream
      addItemsStream: watchedProjectsStream.flatMap ({ task }) ->
        Bacon.fromEvent(task, 'add')
      removeItemsStream: watchedProjectsStream.flatMap ({ task }) ->
        Bacon.fromEvent(task, 'unlink')
    }, {
      scrollTopBus: scrollTopBus
      bodyHeightBus: bodyHeightBus
    }

    # Side effects
    vdomTreesProp.onValue ([currentTree, newTree]) =>
      if newTree
        @rootNode = patch(@rootNode, diff(currentTree, newTree))
      else
        @rootNode = createElement(currentTree)
        @panel = atom.workspace.addTopPanel {
          item: @rootNode
        }

    bodyHeightBus.debounce(500).onValue (newHeight) ->
      atom.config.set('atom-notational.bodyHeight', newHeight)

    terminateProjectsProp = projectsProp.sampledBy(@deactivateStream)
    terminateProjectsProp.onValue (projects) ->
      for { task } in projects
        task.send('finish')


  deactivate: ->
    @deactivateStream.push(true)
    @panel?.destroy()
    @rootNode = null
