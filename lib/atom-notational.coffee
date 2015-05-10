Bacon = require 'baconjs'
createElement = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
renderRoot = require './virtual-dom/root'
calcs = require './prop-calculations'
moment = require 'moment'
atomProjectPaths = require './atom/project-paths.coffee'
atomStreams = require './atom/streams.coffee'
{ Task } = require 'atom'

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

    { addStream, removeStream } = atomProjectPaths()
    addProjectsStream = addStream.map (path) ->
      task = new Task(require.resolve('./tasks/watch-path.coffee'))
      task.start(path)
      return {
        path: path
        task: task
      }

    projectsProp = Bacon.update [],
      [addProjectsStream], (projects, project) -> projects.concat(project)
      [removeStream], (projects, removedPath) ->
        [removedProject] = projects.filter ({ path }) -> path is removedPath
        removedProject.task.send('finish') if removedProject
        projects.filter ({ path }) -> path isnt removedPath

    terminateProjectsProp = projectsProp.sampledBy(@deactivateStream)
    terminateProjectsProp.onValue (projects) ->
      task.send('finish') for { task } in projects

    addItemsStream = addProjectsStream.flatMap ({ task }) -> Bacon.fromEvent(task, 'add')
    removeItemsStream = addProjectsStream.flatMap ({ task }) -> Bacon.fromEvent(task, 'unlink')

    itemsProp = Bacon.update [],
      [addItemsStream], (items, newItem) -> items.concat(newItem)
      [removeItemsStream], (items, { relPath }) ->
        items.filter (item) -> item.relPath isnt relPath
      [removeStream], (items, removedPath) ->
        items.filter ({ projectPath }) -> projectPath isnt removedPath

    matchingItemsProp = itemsProp

    # Source streams
    rowHeightStream = atomStreams.fromConfig 'atom-notational.rowHeight'
    bodyHeightStream = atomStreams.fromConfig 'atom-notational.bodyHeight'
    scrollTopBus = new Bacon.Bus()
    bodyHeightBus = new Bacon.Bus()

    # Meta props
    columns = Bacon.constant [{
      title: 'Name'
      width: 60
      cellContent: (item) -> item.relPath
    },{
      title: 'Date created'
      width: 20
      cellContent: (item) -> moment(item.stats.birthtime).fromNow()
    },{
      title: 'Date modified'
      width: 20
      cellContent: (item) -> moment(item.stats.mtime).fromNow()
    }]

    # View props
    scrollTopProp = scrollTopBus.toProperty(0)
    rowHeightProp = rowHeightStream.toProperty()
    bodyHeightProp = bodyHeightStream
      .merge(bodyHeightBus)
      .skipDuplicates()
      .filter (height) -> height > 0
      .toProperty()
    visibleBeginProp = Bacon.combineWith(calcs.visibleBeginOffset, scrollTopProp, rowHeightProp)
    visibleEndProp = Bacon.combineWith(calcs.visibleEndOffset, visibleBeginProp, bodyHeightProp, rowHeightProp)
    topOffsetProp = Bacon.combineWith(calcs.topOffset, scrollTopProp, rowHeightProp)
    marginBottomProp = Bacon.combineWith(calcs.marginBottom, matchingItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp)
    visibleItemsProp = Bacon.combineWith(calcs.visibleItems, matchingItemsProp, visibleBeginProp, visibleEndProp)
    reverseStripesProp = visibleBeginProp.map (begin) -> begin % 2 is 0

    dataProp = Bacon.combineTemplate {
      items: visibleItemsProp
      bodyHeight: bodyHeightProp
      rowHeight: rowHeightProp
      scrollTop: scrollTopProp
      topOffset: topOffsetProp
      reverseStripes: reverseStripesProp
      marginBottom: marginBottomProp
      columns: columns
    }
    renderedTreesProp = Bacon.combineWith (data) ->
      renderRoot data, {
        scrollTopBus: scrollTopBus
        bodyHeightBus: bodyHeightBus
      }
    , dataProp, Bacon.interval(1000, undefined)
    .slidingWindow(2, 1)


    # Side effects
    # Create panel/update element
    renderedTreesProp.onValue ([currentTree, newTree]) =>
      if newTree
        @rootNode = patch(@rootNode, diff(currentTree, newTree))
      else
        @rootNode = createElement(currentTree)
        @panel = atom.workspace.addTopPanel {
          item: @rootNode
        }

    # Persist new height
    bodyHeightBus.debounce(500).onValue (newHeight) ->
      atom.config.set('atom-notational.bodyHeight', newHeight)

  deactivate: ->
    @deactivateStream.push(true)
    @panel?.destroy()
    @rootNode = null
