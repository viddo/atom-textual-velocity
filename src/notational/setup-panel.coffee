Bacon = require 'baconjs'
h = require 'virtual-dom/h'
adjustScrollTopForSelectedItem = require './adjust-scroll-top-for-selected-item.coffee'
selectedScrollTop = require './selected-scroll-top.coffee'
navArray = require './navigate_array.coffee'
search = require './vdom/search.coffee'
header = require './vdom/header.coffee'
content = require './vdom/content.coffee'
scrollableContent = require './vdom/scrollable-content.coffee'
resizeHandle = require './vdom/resize-handle.coffee'
vdomTreeToElement = require './vdom-tree-to-element.coffee'

module.exports = ({itemsProp, bodyHeightStream, rowHeightStream, moveSelectedStream}) ->
  rowHeightProp = rowHeightStream.toProperty()
  bodyHeightBus = new Bacon.Bus()
  bodyHeightProp = bodyHeightStream.merge(bodyHeightBus)
    .skipDuplicates()
    .filter (height) -> height > 0
    .toProperty()

  searchBus = new Bacon.Bus()
  matchedItemsProp = Bacon.combineWith (items, searchStr) ->
    if searchStr
      items.filter (item) ->
        item.relPath.toLowerCase().search(searchStr) isnt -1
    else
      items
  , itemsProp, searchBus.toProperty('')

  scrollTopBus = new Bacon.Bus()
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

  unsubscribe = Bacon.when([selectItemStream, elementProp], (..., el) ->
    # Scroll item into the view if outside the visible border and was triggered by selectItem change
    selectedRow = el.querySelector('.is-selected')
    if selectedRow
      selectedRow.scrollIntoViewIfNeeded(false) # false=only scroll the minimal necessary
  ).onValue() # no-op to setup the listener

  return {
    elementProp: elementProp
    resizedBodyHeightProp: bodyHeightProp
    unsubscribe: unsubscribe
  }
