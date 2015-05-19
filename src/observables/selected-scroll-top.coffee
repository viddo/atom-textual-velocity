Bacon = require 'baconjs'

module.exports = ({ matchingItemsProp, selectedItemProp, rowHeightProp, scrollTopProp, bodyHeightProp }) ->
  Bacon.combineWith (items, selectedItem, rowHeight, scrollTop, bodyHeight) ->
    return scrollTop unless selectedItem

    for item, i in items
      break if item is selectedItem

    selectedScrollTop = i * rowHeight
    if selectedScrollTop < scrollTop
      # selected item is located before visible items
      selectedScrollTop
    else if selectedScrollTop >= scrollTop + bodyHeight
      # selected item is located after visible items
      selectedScrollTop - bodyHeight + rowHeight
    else
      scrollTop # just pass the scroll top through
  , matchingItemsProp, selectedItemProp, rowHeightProp, scrollTopProp, bodyHeightProp
