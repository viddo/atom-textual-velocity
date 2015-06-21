Bacon                          = require 'baconjs'
h                              = require 'virtual-dom/h'
createElement                  = require 'virtual-dom/create-element'
diff                           = require 'virtual-dom/diff'
patch                          = require 'virtual-dom/patch'
adjustScrollTopForSelectedItem = require './adjust-scroll-top-for-selected-item'
selectItemByRelativeOffset     = require './select-item-by-relative-offset'
search                         = require './vdom/search'
header                         = require './vdom/header'
content                        = require './vdom/content'
scrollableContent              = require './vdom/scrollable-content'
resizeHandle                   = require './vdom/resize-handle'

# Encapsulates the general logic
module.exports = ({matchedItemsProp, columnsProp, rowHeightProp, bodyHeightStream, searchBus}) ->
  bodyHeightBus = new Bacon.Bus()
  keydownBus    = new Bacon.Bus()
  scrollTopBus  = new Bacon.Bus()
  selectItemBus = new Bacon.Bus()
  focusBus      = new Bacon.Bus()

  # Setup streams for search key inputs
  resetStream        = keydownBus.filter (ev) -> ev.keyCode is 27 #esc
  openSelectedStream = keydownBus.filter (ev) -> ev.keyCode is 13 #enter
  moveSelectedStream = keydownBus.filter((ev) -> ev.keyCode is 38).doAction((ev) -> ev.preventDefault()).map(-1) #up
                .merge(keydownBus.filter((ev) -> ev.keyCode is 40).doAction((ev) -> ev.preventDefault()).map(1)) #down

  selectedItemProp = Bacon.update(undefined,
    [searchBus], -> undefined
    [selectItemBus], (..., newItem) -> newItem
    [moveSelectedStream, matchedItemsProp], selectItemByRelativeOffset
  ).skipDuplicates()

  # Setup props related to the scrollable content
  bodyHeightProp = bodyHeightBus.merge(bodyHeightStream)
    .skipDuplicates()
    .filter (height) -> height > 0
    .toProperty(100)

  scrollTopProp = Bacon.update 0,
    [scrollTopBus], (..., scrollTop) -> scrollTop
    [selectedItemProp.changes(), matchedItemsProp, rowHeightProp, bodyHeightProp], adjustScrollTopForSelectedItem

  visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0
  , scrollTopProp, rowHeightProp

  visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
  , visibleBeginProp, bodyHeightProp, rowHeightProp

  # Setup vdom of scrollable content
  scrollableContentProp = Bacon.combineTemplate({
    bodyHeight: bodyHeightProp
    scrollTop: scrollTopProp
    content: Bacon.combineTemplate({
        columns: columnsProp
        selectedItem: selectedItemProp
        reverseStripes: visibleBeginProp.map (begin) ->
          begin % 2 is 0
        items: Bacon.combineWith (items, begin, end) ->
          items.slice(begin, end)
        , matchedItemsProp, visibleBeginProp, visibleEndProp
      }).map (data) ->
        content(data, selectItemBus)
    topOffset: Bacon.combineWith (scrollTop, rowHeight) ->
        -(scrollTop % rowHeight)
      , scrollTopProp, rowHeightProp
    marginBottom: Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
        items.length * rowHeight - scrollTop - bodyHeight
      , matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp
  }).map (data) ->
    scrollableContent(data, scrollTopBus)

  vdomTreeProp = Bacon.combineWith (columns, scrollableContent, bodyHeight) ->
    h 'div.atom-notational-panel', {
      onclick: -> focusBus.push undefined
    }, [
      search(searchBus, keydownBus)
      header(columns)
      scrollableContent
      resizeHandle(bodyHeight, bodyHeightBus)
    ]
  , columnsProp, scrollableContentProp, bodyHeightProp

  initialTree = h 'div.atom-notational-panel'
  renderProp = Bacon.update {
    el   : createElement(initialTree)
    tree : initialTree
  },
    [vdomTreeProp.toEventStream()], ({el, tree}, newTree) ->
      return {
        el   : patch(el, diff(tree, newTree))
        tree : newTree
      }
    [selectedItemProp.changes()], (current, ...) ->
      # Scroll item into the view if outside the visible border and was triggered by selectItem change
      if selectedRow = current.el.querySelector('.is-selected')
        selectedRow.scrollIntoViewIfNeeded(false) # centerIfNeeded=false => croll minimal possible to avoid jumps
      return current
    [focusBus], (current, ...) ->
      current.el.querySelector('.search').focus()
      return current
    [resetStream], (current, ...) ->
      current.el.querySelector('.search').value = ''
      searchBus.push('')
      return current
    [searchBus], (current, ...) ->
      current.el.querySelector('.tbody').scrollTop = 0 #return to top
      return current

  # double-key press within 300ms triggers a hide event
  hideStream = resetStream.bufferWithTimeOrCount(300, 2).filter (x) ->
    x.length is 2

  return {
    elementProp           : renderProp.map('.el')
    resizedBodyHeightProp : bodyHeightProp
    selectedItemProp      : selectedItemProp
    openSelectedStream    : openSelectedStream
    hideStream            : hideStream
  }
