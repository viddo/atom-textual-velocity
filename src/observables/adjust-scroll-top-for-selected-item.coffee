Bacon = require 'baconjs'

# @param {Object} of properties
# @return {Property} adjusted scrollTop value so selected item appear within the visible bounds
module.exports = ({bodyHeightProp, rowHeightProp, currentScrollTopProp, selectedScrollTopProp}) ->
  Bacon.combineWith (bodyHeight, rowHeight, currentScrollTop, selectedScrollTop) ->
    console.warn 'adjust  …', arguments
    # ....[...].... no selected item, just return current scrollTop value
    return currentScrollTop unless selectedScrollTop >= 0

    if selectedScrollTop < currentScrollTop
      # selected item is located before the visible bounds
      # .X..[...]....
      # .[X..].......
      selectedScrollTop
    else if currentScrollTop + bodyHeight <= selectedScrollTop
      # selected item is located after the visible bounds
      # ....[...]..X.
      # .......[..X].
      selectedScrollTop - bodyHeight + rowHeight
    else
      # ....[.X.].... selected item is located within the visible bounds, just return the current scrollTop value
      currentScrollTop
  , bodyHeightProp, rowHeightProp, currentScrollTopProp, selectedScrollTopProp
