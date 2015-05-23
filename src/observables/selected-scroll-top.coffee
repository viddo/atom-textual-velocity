Bacon = require 'baconjs'

# @param {Object} of properties
# @return {Property} calculated scroll top for selected item OR undefined if there is no selected item
module.exports = ({itemsProp, selectedItemProp, rowHeightProp})->
  Bacon.combineWith (items, selectedItem, rowHeight) ->
    return unless selectedItem
    for item, idx in items
      if item is selectedItem
        return idx * rowHeight
  , itemsProp, selectedItemProp, rowHeightProp
