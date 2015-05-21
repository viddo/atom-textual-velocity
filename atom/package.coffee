{Task} = require 'atom'
Bacon = require 'baconjs'
atoms = require './streams.coffee'
projects = require '../src/observables/projects.coffee'
selectedScrollTop = require '../src/observables/selected-scroll-top.coffee'
content = require '../src/vdom/content.coffee'
scrollableContent = require '../src/vdom/scrollable-content.coffee'
root = require '../src/vdom/root.coffee'
rootNode = require '../src/observables/root-node.coffee'
navArray = require '../src/navigate_array.coffee'
Path = require 'path'


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

    bodyHeightProp = atoms.fromConfig('atom-notational.bodyHeight')
      .merge(bodyHeightBus)
      .skipDuplicates()
      .filter (height) -> height > 0
      .toProperty()

    addItemsStream = watchedProjectsStream.flatMap ({ task }) ->
      Bacon.fromEvent(task, 'add')
    removeItemsStream = watchedProjectsStream.flatMap ({ task }) ->
      Bacon.fromEvent(task, 'unlink')
    itemsProp = Bacon.update [],
      [addItemsStream], (items, newItem) ->
        items.concat(newItem)
      [removeItemsStream], (items, { relPath }) ->
        items.filter (item) ->
          item.relPath isnt relPath
      [removedStream], (items, removedPath) ->
        items.filter ({ projectPath }) ->
          projectPath isnt removedPath

    searchBus = new Bacon.Bus()
    matchedItemsProp = Bacon.combineWith (items, searchStr) ->
      if searchStr
        items.filter (item) ->
          item.relPath.toLowerCase().search(searchStr) isnt -1
      else
        items
    , itemsProp, searchBus.toProperty('')

    rowHeightProp = atoms.fromConfig('atom-notational.rowHeight').toProperty()

    scrollTopBus = new Bacon.Bus()

    moveSelectedStream = atoms.fromCommand('.atom-notational-search', 'core:move-down').map(1)
      .merge(atoms.fromCommand('.atom-notational-search', 'core:move-up').map(-1))
    selectedItemBus = new Bacon.Bus()
    selectedItemProp = Bacon.update false,
      [selectedItemBus], (currentItem, item) -> item
      [moveSelectedStream, matchedItemsProp], (currentItem, relativeOffset, items) ->
        selectedItemBus.push if currentItem
                               navArray.byRelativeOffset items, relativeOffset, (item) -> currentItem is item
                             else if relativeOffset < 0
                               NavigateArray.byOffset(items, -1)
                             else
                               items[0]
    selectedScrollTopProp = selectedScrollTop(
      bodyHeightProp: bodyHeightProp
      rowHeightProp: rowHeightProp
      matchingItemsProp: matchedItemsProp
      selectedItemProp: selectedItemBus.toProperty(false)
      scrollTopProp: scrollTopBus.toProperty(0)
    )
    scrollTopProp = Bacon.update 0,
      [scrollTopBus], (prev, scrollTop) -> scrollTop
      [selectedItemBus, selectedScrollTopProp], (prev, selectedItem, scrollTop) -> scrollTop
    topOffsetProp = Bacon.combineWith (scrollTop, rowHeight) ->
      -(scrollTop % rowHeight)
    , scrollTopProp, rowHeightProp

    visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
      (scrollTop / rowHeight) | 0
    , scrollTopProp, rowHeightProp
    visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
      begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
    , visibleBeginProp, bodyHeightProp, rowHeightProp

    visibleItemsProp = Bacon.combineWith (items, begin, end) ->
      items.slice(begin, end)
    , matchedItemsProp, visibleBeginProp, visibleEndProp

    reverseStripesProp = visibleBeginProp.map (begin) ->
      begin % 2 is 0

    topOffset: Bacon.combineWith (scrollTop, rowHeight) ->
        -(scrollTop % rowHeight)
      , scrollTopProp, rowHeightProp
    marginBottomProp = Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
        items.length * rowHeight - scrollTop - bodyHeight
      , matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp


    contentProp = Bacon.combineTemplate({
      reverseStripes: reverseStripesProp
      items: visibleItemsProp
      selectedItem: selectedItemProp
    }).map (data) ->
      content(data, selectedItemBus)

    bodyContentProp = Bacon.combineTemplate({
      bodyHeight: bodyHeightProp
      topOffset: topOffsetProp
      scrollTop: scrollTopProp
      marginBottom: marginBottomProp
      content: contentProp
    }).map (data) ->
      scrollableContent(data, scrollTopBus)

    rootProp = Bacon.combineWith (bodyContent, bodyHeight) ->
      root(bodyContent, bodyHeight, {
        searchBus: searchBus
        bodyHeightBus: bodyHeightBus
      })
    , bodyContentProp, bodyHeightProp
    rootNodeProp = rootNode(rootProp)


    # Side effects
    @subscriptions.push(
      rootNodeProp.map (rootNode) ->
        rootNode.querySelector('.is-selected')
      .filter (ifAnySelected) -> ifAnySelected
      .onValue (selectedRow) ->
        # Scroll item into the view if outside the visible border
        selectedRow.scrollIntoViewIfNeeded(false) # false=only scroll the minimal necessary
    )

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
    @previewOpener.dispose()
    @deactivateBus.push(true)
    unsubscribe() for unsubscribe in @subscriptions
    @panel?.destroy()
