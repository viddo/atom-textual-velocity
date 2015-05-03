Bacon = require 'baconjs'
createElement = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
renderRoot = require './virtual-dom/root'
calcs = require './prop-calculations'
moment = require 'moment'
chokidar = require 'chokidar'

fromAtomConfig = (key) ->
  Bacon.fromBinder (sink) ->
    disposable = atom.config.observe key, sink
    return -> disposable.dispose()

module.exports =
  panel: undefined
  rootNode: undefined
  prevTree: undefined

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
    rowHeightStream = fromAtomConfig('atom-notational.rowHeight')
    bodyHeightStream = fromAtomConfig('atom-notational.bodyHeight')
    scrollTopBus = new Bacon.Bus()
    bodyHeightBus = new Bacon.Bus()
    filesStream = new Bacon.Bus()

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
    renderedTreeProp.onValue (newTree) =>
      if @rootNode
        @rootNode = patch(@rootNode, diff(@prevTree, newTree))
      else
        @rootNode = createElement(newTree)
        @panel = atom.workspace.addTopPanel {
          item: @rootNode
        }
      @prevTree = newTree

    # Persist new height
    bodyHeightBus.debounce(500).onValue (newHeight) ->
      atom.config.set('atom-notational.bodyHeight', newHeight)

  deactivate: ->
    @panel?.destroy()
    @prevTree = null
    @rootNode = null
    @watcher.close()
