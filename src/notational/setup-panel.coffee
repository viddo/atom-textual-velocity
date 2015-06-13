Bacon = require 'baconjs'
h = require 'virtual-dom/h'
adjustScrollTopForSelectedItem = require './adjust-scroll-top-for-selected-item'
selectItemByRelativeOffset = require './select-item-by-relative-offset'
search = require './vdom/search'
header = require './vdom/header'
content = require './vdom/content'
scrollableContent = require './vdom/scrollable-content'
resizeHandle = require './vdom/resize-handle'
vdomTreeToElement = require './vdom-tree-to-element'

# Encapsulates the general logic
module.exports = ({itemsProp, columnsProp, bodyHeightStream, rowHeightStream}) ->
  rowHeightProp = rowHeightStream.toProperty()
  bodyHeightBus = new Bacon.Bus()
  bodyHeightProp = bodyHeightStream.merge(bodyHeightBus)
                                   .skipDuplicates()
                                   .filter (height) -> height > 0
                                   .toProperty()
  keyInputBus = new Bacon.Bus()
  resetStream        = keyInputBus.filter (ev) -> ev.keyCode is 27 #esc
  openSelectedStream = keyInputBus.filter (ev) -> ev.keyCode is 13 #enter
  moveSelectedStream = keyInputBus.filter((ev) -> ev.keyCode is 38).doAction((ev) -> ev.preventDefault()).map(-1) #up
                .merge(keyInputBus.filter((ev) -> ev.keyCode is 40).doAction((ev) -> ev.preventDefault()).map(1)) #down

  searchBus = new Bacon.Bus()
  searchProp = Bacon.update '',
    [searchBus.skipDuplicates()], (..., lastStr) -> lastStr
    [resetStream], -> ''
  matchedItemsProp = Bacon.combineWith (items, searchStr) ->
    return items unless searchStr
    items.filter (item) ->
      item.relPath.toLowerCase().search(searchStr) isnt -1
  , itemsProp, searchProp

  scrollTopBus = new Bacon.Bus()
  selectItemBus = new Bacon.Bus()
  selectedItemProp = Bacon.update(undefined,
    [searchProp.changes()], -> undefined
    [selectItemBus], (..., newItem) -> newItem
    [moveSelectedStream, matchedItemsProp], selectItemByRelativeOffset
  ).skipDuplicates()

  scrollTopProp = Bacon.update 0,
    [scrollTopBus], (..., scrollTop) -> scrollTop
    [selectedItemProp.changes(), matchedItemsProp, rowHeightProp, bodyHeightProp], adjustScrollTopForSelectedItem

  visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0
  , scrollTopProp, rowHeightProp
  visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
  , visibleBeginProp, bodyHeightProp, rowHeightProp

  # vdom props
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

  resizeHandleProp = bodyHeightProp.map (bodyHeight) ->
    resizeHandle(bodyHeight, bodyHeightBus)

  headerProp = columnsProp.map (columns) ->
    header(columns)

  vdomTreeProp = Bacon.combineWith (contentHeader, scrollableContent, resizeHandle) ->
    h 'div.atom-notational-panel', [
      search(searchBus, keyInputBus)
      contentHeader
      scrollableContent
      resizeHandle
    ]
  , headerProp, scrollableContentProp, resizeHandleProp
  elementProp = vdomTreeToElement(vdomTreeProp)

  dispose = Bacon.when(
    [selectedItemProp.changes(), elementProp], (..., el) ->
      # Scroll item into the view if outside the visible border and was triggered by selectItem change
      selectedRow = el.querySelector('.is-selected')
      if selectedRow
        selectedRow.scrollIntoViewIfNeeded(false) # centerIfNeeded=false => croll minimal possible to avoid jumps
      el.querySelector('.search').focus()
    [resetStream, elementProp], (..., el) ->
      el.querySelector('.search').value = ''
    [searchProp.changes(), elementProp], (..., el) ->
      el.querySelector('.tbody').scrollTop = 0 #return to top
  ).onValue() # no-op to setup the listener

  dispose.elementProp = elementProp
  dispose.resizedBodyHeightProp = bodyHeightProp
  dispose.selectedItemProp = selectedItemProp
  dispose.openSelectedStream = openSelectedStream
  dispose.hideStream = resetStream.bufferWithTimeOrCount(300, 2).filter (x) => x.length is 2

  return dispose
