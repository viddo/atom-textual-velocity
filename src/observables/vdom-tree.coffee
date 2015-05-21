Bacon = require 'baconjs'
root = require '../vdom/root.coffee'
columns = require '../columns.coffee'
navArray = require '../navigate_array.coffee'
selectedScrollTop = require './selected-scroll-top.coffee'

module.exports = ({ bodyHeightProp, rowHeightProp, matchedItemsProp, moveSelectedStream}, buses) ->
  {scrollTopBus, searchBus, selectedItemBus} = buses

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
    matchingItemsProp: matchedItemsProp
    selectedItemProp: selectedItemBus.toProperty(false)
    rowHeightProp: rowHeightProp
    scrollTopProp: scrollTopBus.toProperty(0)
    bodyHeightProp: bodyHeightProp
  )
  scrollTopProp = Bacon.update 0,
    [scrollTopBus], (prev, scrollTop) -> scrollTop
    [selectedItemBus, selectedScrollTopProp], (prev, selectedItem, scrollTop) -> scrollTop

  visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0
  , scrollTopProp, rowHeightProp
  visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
  , visibleBeginProp, bodyHeightProp, rowHeightProp

  return Bacon.combineTemplate(
    bodyHeight: bodyHeightProp
    selectedItem: selectedItemProp
    scrollTop: scrollTopProp
    topOffset: Bacon.combineWith (scrollTop, rowHeight) ->
        -(scrollTop % rowHeight)
      , scrollTopProp, rowHeightProp
    marginBottom: Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
        items.length * rowHeight - scrollTop - bodyHeight
      , matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp
    reverseStripes: visibleBeginProp.map (begin) ->
      begin % 2 is 0
    items: Bacon.combineWith (items, begin, end) ->
        items.slice(begin, end)
      , matchedItemsProp, visibleBeginProp, visibleEndProp
  ).map (data) ->
    root(data, columns, buses)
