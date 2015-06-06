module.exports = (currentScrollTop, selectedItem, items, rowHeight, bodyHeight) ->
  return currentScrollTop unless selectedItem

  selectedScrollTop = items.indexOf(selectedItem) * rowHeight

  if currentScrollTop > selectedScrollTop
    # selected item is located before the visible bounds
    # from: .X..[...]....
    # to:   .[X..].......
    selectedScrollTop
  else if currentScrollTop + bodyHeight <= selectedScrollTop
    # selected item is located after the visible bounds
    # from: ....[...]..X.
    # to:   .......[..X].
     selectedScrollTop - bodyHeight + rowHeight
  else
    # selected item is located within the visible bounds, just return the current scrollTop value
    currentScrollTop
