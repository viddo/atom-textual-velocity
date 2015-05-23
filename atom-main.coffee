{Task} = require 'atom'
Bacon = require 'baconjs'
h = require 'virtual-dom/h'
Path = require 'path'
atoms = require './src/atom/streams.coffee'

adjustScrollTopForSelectedItem = require './src/notational/adjust-scroll-top-for-selected-item.coffee'
selectedScrollTop = require './src/notational/selected-scroll-top.coffee'
search = require './src/notational/vdom/search.coffee'
header = require './src/notational/vdom/header.coffee'
content = require './src/notational/vdom/content.coffee'
scrollableContent = require './src/notational/vdom/scrollable-content.coffee'
resizeHandle = require './src/notational/vdom/resize-handle.coffee'
vdomTreeToElement = require './src/notational/vdom-tree-to-element.coffee'
navArray = require './src/notational/navigate_array.coffee'

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
    selectItemBus = new Bacon.Bus()
    selectItemStream = selectItemBus.filter (item) -> item
    selectedItemProp = Bacon.update undefined,
      [selectItemStream], (..., item) -> item
      [moveSelectedStream, matchedItemsProp], (currentItem, relativeOffset, items) ->
        selectItemBus.push if currentItem
                               navArray.byRelativeOffset items, relativeOffset, (item) ->
                                 currentItem is item
                             else if relativeOffset < 0
                               navArray.byOffset(items, -1)
                             else
                               items[0]
    adjustedScrollTopForSelectedItemProp = adjustScrollTopForSelectedItem(
      bodyHeightProp: bodyHeightProp
      rowHeightProp: rowHeightProp
      currentScrollTopProp: scrollTopBus.toProperty(0)
      selectedScrollTopProp: selectedScrollTop(
          itemsProp: matchedItemsProp
          selectedItemProp: selectedItemProp
          rowHeightProp: rowHeightProp
        )
    )
    scrollTopProp = Bacon.update 0,
      [scrollTopBus], (..., scrollTop) -> scrollTop
      [selectItemStream, adjustedScrollTopForSelectedItemProp], (..., adjustedScrollTop) -> adjustedScrollTop
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

    # vdom props
    contentProp = Bacon.combineTemplate({
      reverseStripes: reverseStripesProp
      items: visibleItemsProp
      selectedItem: selectedItemProp
    }).map (data) ->
      content(data, selectItemBus)

    scrollableContentProp = Bacon.combineTemplate({
      bodyHeight: bodyHeightProp
      topOffset: topOffsetProp
      scrollTop: scrollTopProp
      marginBottom: marginBottomProp
      content: contentProp
    }).map (data) ->
      scrollableContent(data, scrollTopBus)

    resizeHandleProp = bodyHeightProp.map (bodyHeight) ->
      resizeHandle(bodyHeight, bodyHeightBus)

    vdomTreeProp = Bacon.combineWith (scrollableContent, resizeHandle) ->
      h 'div.atom-notational-panel', [
        search(searchBus)
        header()
        scrollableContent
        resizeHandle
      ]
    , scrollableContentProp, resizeHandleProp
    elementProp = vdomTreeToElement(vdomTreeProp)

    # TODO: this should probably be moved, since not specific to atom
    @_subscribe(
      Bacon.when([selectItemStream, elementProp], (..., el) ->
        # Scroll item into the view if outside the visible border and was triggered by selectItem change
        selectedRow = el.querySelector('.is-selected')
        if selectedRow
          selectedRow.scrollIntoViewIfNeeded(false) # false=only scroll the minimal necessary
      ).onValue() # no-op to setup the listener
    )

    # Side effects
    @_subscribe(
      elementProp.onValue (el) =>
        @panel = atom.workspace.addTopPanel(item: el) unless @panel
    )

    @_subscribe(
      bodyHeightBus.debounce(500).onValue (newHeight) ->
        atom.config.set('atom-notational.bodyHeight', newHeight)
    )

    terminateProjectsProp = projectsProp.sampledBy(@deactivateBus)
    terminateProjectsProp.onValue (projects) ->
      for { task } in projects
        task.send('finish')
      return Bacon.noMore

  _subscribe: (subscription) ->
    @subscriptions.push(subscription)

  deactivate: ->
    @deactivateBus.push(true)
    unsubscribe() for unsubscribe in @subscriptions
    @panel?.destroy()
