Bacon = require 'baconjs'
root = require '../vdom/root.coffee'
columns = require '../columns.coffee'

module.exports = ({bodyHeightProp, itemsProp, reverseStripesProp, marginBottomProp, selectedItemProp, scrollTopProp, topOffsetProp}, buses) ->
  return Bacon.combineTemplate(
    bodyHeight: bodyHeightProp
    reverseStripes: reverseStripesProp
    items: itemsProp
    marginBottom: marginBottomProp
    selectedItem: selectedItemProp
    scrollTop: scrollTopProp
    topOffset: topOffsetProp
  ).map (data) ->
    root(data, columns, buses)
