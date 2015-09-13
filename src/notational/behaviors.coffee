R = require 'ramda'

KEY_CODES = {
  ENTER : 13
  ESC   : 27
  UP    : 38
  DOWN  : 40
}

# Pure functions that returns some value based on implemented and desired behavior
# Should also give more semantics to some calculations
module.exports = {

  isEven: R.pipe(R.modulo(R.__, 2), R.equals(0))
  lastArg: R.nthArg(-1)
  preventDefault: R.invoker(0, 'preventDefault')
  querySelector: R.invoker(1, 'querySelector')

  isEventKey: R.curry (keyName, ev) ->
    #isKeyCode: R.propEq('keyCode')
    ev.keyCode is KEY_CODES[keyName.toUpperCase()]


  itemForSelectOffset: (currentItem, selectOffset, items) ->
    newIndex = items.indexOf(currentItem) + selectOffset
    items[(
      if newIndex >= 0
        # Get next, but stop if reached last item
        if newIndex < items.length then newIndex else newIndex - 1
      else
        # Get prev until reaching first item, or cycle to last item if there is no selection
        if currentItem isnt undefined then 0 else items.length - 1
    )]

  # Adjust scrolltop "[...]" for selected item "X" (if there is one)
  adjustScrollTopForSelectedItem: (currentScrollTop, selectedItem, items, rowHeight, bodyHeight) ->
    return currentScrollTop unless selectedItem

    selectedScrollTop = items.indexOf(selectedItem) * rowHeight

    if currentScrollTop > selectedScrollTop
      # selected item is located before the visible bounds
      # from: ..X..[...]..
      # to:   .[X..]......
      selectedScrollTop
    else if currentScrollTop + bodyHeight <= selectedScrollTop
      # selected item is located after the visible bounds
      # from: ..[...]..X..
      # to:   ......[..X].
       selectedScrollTop - bodyHeight + rowHeight
    else
      # selected item is located within the visible bounds, just return the current scrollTop value
      currentScrollTop

}
