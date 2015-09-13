Bacon     = require 'baconjs'
R         = require 'ramda'
vDom      = require 'virtual-dom'
vDomTrees = require './vdom-trees'
Beh       = require './behaviors.coffee'

module.exports = ({searchBus, matchedItemsProp, columnsProp, bodyHeightStream}) ->
  bodyHeightBus = new Bacon.Bus()
  scrollTopBus  = new Bacon.Bus()
  selectItemBus = new Bacon.Bus()
  focusBus      = new Bacon.Bus()
  inputBus      = new Bacon.Bus()
  keyDownBus    = new Bacon.Bus()

  resetStream        = keyDownBus.filter Beh.isEventKey('esc')
  selectPrevStream   = keyDownBus.filter(Beh.isEventKey('up')).doAction(Beh.preventDefault)
  selectNextStream   = keyDownBus.filter(Beh.isEventKey('down')).doAction(Beh.preventDefault)
  selectOffsetStream = selectPrevStream.map(-1).merge(selectNextStream.map(1))

  inputValueStream = inputBus.map('.target.value')
  searchStream = inputValueStream.merge resetStream.map('')
  searchBus.plug(searchStream)

  selectedItemProp = Bacon.update(undefined,
    [searchStream],  R.always(undefined)
    [selectItemBus], Beh.lastArg
    [selectOffsetStream, matchedItemsProp], Beh.itemForSelectOffset
  ).skipDuplicates()

  # Setup props related to the scrollable content
  rowHeightProp = Bacon.constant(25)
  bodyHeightProp = bodyHeightBus.merge(bodyHeightStream)
    .skipDuplicates()
    .filter (newHeight) -> newHeight > 0
    .toProperty(100)

  scrollTopProp = Bacon.update 0,
    [scrollTopBus], Beh.lastArg
    [selectedItemProp.changes(), matchedItemsProp, rowHeightProp, bodyHeightProp], Beh.adjustScrollTopForSelectedItem

  visibleBeginProp = Bacon.combineWith [scrollTopProp, rowHeightProp], (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0

  visibleEndProp = Bacon.combineWith [visibleBeginProp, bodyHeightProp, rowHeightProp], (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add 2 to avoid visible gap when scrolling

  # Setup vDom of scrollable content
  contentProp = Bacon.combineTemplate({
    columns        : columnsProp
    selectedItem   : selectedItemProp
    reverseStripes : visibleBeginProp.map Beh.isEven
    items          : Bacon.combineWith(R.slice, visibleBeginProp, visibleEndProp, matchedItemsProp)
  }).map vDomTrees.content(selectItemBus)

  scrollableContentProp = Bacon.combineTemplate({
    bodyHeight   : bodyHeightProp
    scrollTop    : scrollTopProp
    content      : contentProp
    topOffset    : Bacon.combineWith(R.pipe(R.modulo, R.negate), scrollTopProp, rowHeightProp)
    marginBottom : Bacon.combineWith [matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp], (items, rowHeight, scrollTop, bodyHeight) ->
      items.length * rowHeight - scrollTop - bodyHeight
  }).map vDomTrees.scrollableContent(scrollTopBus)

  vDomTreeProp = Bacon.combineWith [columnsProp, scrollableContentProp, bodyHeightProp], (columns, scrollableContent, bodyHeight) ->
    vDomTrees.root [
      vDomTrees.header(columns)
      scrollableContent
      vDomTrees.resizeHandle(bodyHeight, bodyHeightBus)
    ], {onclick: -> focusBus.push()}

  initialItemsTree = vDomTrees.root()

  return {
    searchElementProp: Bacon.update vDom.create(vDomTrees.search(inputBus, keyDownBus)),
      [focusBus],    R.tap (el) -> el.focus()
      [resetStream], R.tap (el) -> el.value = ''

    itemsElementProp: Bacon.update({el: vDom.create(initialItemsTree), tree: initialItemsTree},
        [vDomTreeProp.toEventStream()], ({el, tree}, newTree) -> {el: vDom.patch(el, vDom.diff(tree, newTree)), tree: newTree}

        # Scroll item into the view if outside the visible boundaries
        # centerIfNeeded=false => scroll minimal possible to avoid jumps
        [selectedItemProp.changes()], Beh.tapItemsElement '.is-selected', (el) -> el?.scrollIntoViewIfNeeded(false)

        [searchStream], Beh.tapItemsElement '.tbody', (el) -> el.scrollTop = 0 # return to top
      ).map('.el')

    openStream            : keyDownBus.filter Beh.isEventKey('enter')
    resizedBodyHeightProp : bodyHeightProp
    selectedItemProp      : selectedItemProp
    resetStream           : resetStream
  }
