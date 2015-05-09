Bacon = require 'baconjs'
createElement = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
renderRoot = require './virtual-dom/root'
calcs = require './prop-calculations'
moment = require 'moment'
chokidar = require 'chokidar'
atomProjectPaths = require './atom/project-paths.coffee'
atomStreams = require './atom/streams.coffee'

module.exports =
  panel: undefined
  rootNode: undefined

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
    # Source streams
    addFileBus = new Bacon.Bus()
    removeFileBus = new Bacon.Bus()
    ignored = atom.config.get('core.ignoredNames').concat(['node_modules']).map (item) ->
      "**/#{item}**/*"
    @watcher = chokidar.watch atom.project.getPaths(), {
      ignored: ignored
      persistent: true
    }
    @watcher.on 'add', (path) ->
      addFileBus.push(path)
    @watcher.on 'unlink', (path) ->
      removeFileBus.push(path)

    rowHeightStream = atomStreams.fromConfig 'atom-notational.rowHeight'
    bodyHeightStream = atomStreams.fromConfig 'atom-notational.bodyHeight'
    scrollTopBus = new Bacon.Bus()
    bodyHeightBus = new Bacon.Bus()
    filesStream = new Bacon.Bus()


    # Meta props
    filesProp = Bacon.update [],
      addFileBus, ((items, path) ->
        items.push path
        return items
      ),
      removeFileBus, (items, path) ->
        items.splice items.indexOf(path), 1
        return items

    columns = Bacon.constant [{
      title: 'Name'
      width: 60
      cellContent: (item) -> item
    },{
      title: 'Date created'
      width: 20
      cellContent: (item) -> ''#moment(item.dateCreated).fromNow()
    },{
      title: 'Date modified'
      width: 20
      cellContent: (item) -> ''#moment(item.dateModified).fromNow()
    }]

    # View props
    matchingItemsProp = filesProp
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
    reverseStripesProp = visibleBeginProp.map (begin) -> begin % 2 == 0

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
    renderedTreeProp = Bacon.combineWith (data) ->
      renderRoot data, {
        scrollTopBus: scrollTopBus
        bodyHeightBus: bodyHeightBus
      }
    , dataProp, Bacon.interval(1000, undefined)

    # Side effects, re-render
    renderedTreeProp.slidingWindow(2, 1).onValue ([currentTree, newTree]) =>
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
    @panel?.destroy()
    @rootNode = null
    @watcher.close()
