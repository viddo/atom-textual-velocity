Bacon   = require 'baconjs'
R       = require 'ramda'

module.exports =
class NotationalItems

  constructor: ({searchStream, addItemsStream, removeItemsStream, closeProjectsStream}) ->
    itemsProp = Bacon.update [],
      [addItemsStream], @concatNewItem
      [removeItemsStream], (items, item) ->
        items.filter R.compose(R.not, R.eqProps('relPath', item, R.__))
      [closeProjectsStream], (items, item) ->
        items.filter R.compose(R.not, R.eqProps('projectPath', item, R.__))

    searchProp = searchStream.skipDuplicates().toProperty('')

    @matchedItemsProp = Bacon.combineWith (items, searchStr) ->
      return items unless searchStr
      items.filter (item) ->
        item.relPath.toLowerCase().search(searchStr.toLowerCase()) isnt -1
    , itemsProp, searchProp

  # (items, item) -> items.concat(item)
  concatNewItem: R.flip(R.invoker(1, 'concat'))
