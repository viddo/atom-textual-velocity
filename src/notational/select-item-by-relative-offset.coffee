module.exports = (currentItem, relativeOffset, items) ->
  offset = items.indexOf(currentItem) + relativeOffset
  return items[switch
    when currentItem and offset < 0 then 0                # stay on 1st item if has a selected item
    when offset < 0                 then items.length - 1 # cycle to last item
    when offset >= items.length     then offset - 1       # stay on last item
    else                                 offset           # offset is within bounds, just pass it
  ]
