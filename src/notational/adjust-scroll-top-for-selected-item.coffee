module.exports = (currentScrollTop, selectedItem, items, rowHeight, bodyHeight) ->
  return currentScrollTop unless selectedItem

  for item, idx in items
    if item is selectedItem
      selectedScrollTop = idx * rowHeight
      break

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
