module.exports = {

  visibleBeginOffset: (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0

  visibleEndOffset: (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling

  topOffset: (scrollTop, rowHeight) ->
    -(scrollTop % rowHeight)

  marginBottom: (items, rowHeight, scrollTop, bodyHeight) ->
    items.length * rowHeight - scrollTop - bodyHeight

  visibleItems: (items, begin, end) ->
    items.slice(begin, end)
}
