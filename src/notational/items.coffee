Bacon                          = require 'baconjs'
R                              = require 'ramda'
createElement                  = require 'virtual-dom/create-element'
diff                           = require 'virtual-dom/diff'
patch                          = require 'virtual-dom/patch'
vDOM                           = require './vdom'
keys                           = require './keys'
selectItemByRelativeOffset     = require './select-item-by-relative-offset'
adjustScrollTopForSelectedItem = require './adjust-scroll-top-for-seleted-item'

module.exports = ({searchBus, matchedItemsProp, columnsProp, bodyHeightStream}) ->
  bodyHeightBus = new Bacon.Bus()
  scrollTopBus  = new Bacon.Bus()
  selectItemBus = new Bacon.Bus()
  focusBus      = new Bacon.Bus()
  inputBus      = new Bacon.Bus()
  keyDownBus    = new Bacon.Bus()

  preventDefault     = R.invoker(0, 'preventDefault')
  abortStream        = keyDownBus.filter keys.isEventCode('esc')
  selectPrevStream   = keyDownBus.filter(keys.isEventCode('up')).doAction(preventDefault)
  selectNextStream   = keyDownBus.filter(keys.isEventCode('down')).doAction(preventDefault)
  moveSelectedStream = selectPrevStream.map(-1).merge(selectNextStream.map(1))

  vdomTree = vDOM.rootNode vDOM.search(inputBus, keyDownBus)
  elementProp = Bacon.update createElement(vdomTree),
    [focusBus], R.tap (el) ->
      el.querySelector('.search').focus()
    [abortStream], R.tap (el) =>
      el.querySelector('.search').value = ''

  inputValueStream = inputBus.map R.path(['target', 'value'])
  searchStream = inputValueStream.merge abortStream.map('')
  searchBus.plug(searchStream)

  selectedItemProp = Bacon.update(undefined,
    [searchStream], -> undefined
    [selectItemBus], (..., newItem) -> newItem
    [moveSelectedStream, matchedItemsProp], selectItemByRelativeOffset
  ).skipDuplicates()

  # Setup props related to the scrollable content
  rowHeightProp = Bacon.constant(25)
  bodyHeightProp = bodyHeightBus.merge(bodyHeightStream)
    .skipDuplicates()
    .filter (height) -> height > 0
    .toProperty(100)

  scrollTopProp = Bacon.update 0,
    [scrollTopBus], (..., scrollTop) -> scrollTop
    [selectedItemProp.changes(), matchedItemsProp, rowHeightProp, bodyHeightProp], adjustScrollTopForSelectedItem

  visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0
  , scrollTopProp, rowHeightProp

  visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
  , visibleBeginProp, bodyHeightProp, rowHeightProp

  # Setup vdom of scrollable content
  scrollableContentProp = Bacon.combineTemplate({
    bodyHeight: bodyHeightProp
    scrollTop: scrollTopProp
    content: Bacon.combineTemplate({
        columns: columnsProp
        selectedItem: selectedItemProp
        reverseStripes: visibleBeginProp.map (begin) ->
          begin % 2 is 0
        items: Bacon.combineWith (items, begin, end) ->
          items.slice(begin, end)
        , matchedItemsProp, visibleBeginProp, visibleEndProp
      }).map (data) ->
        vDOM.content(data, selectItemBus)
    topOffset: Bacon.combineWith (scrollTop, rowHeight) ->
        -(scrollTop % rowHeight)
      , scrollTopProp, rowHeightProp
    marginBottom: Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
        items.length * rowHeight - scrollTop - bodyHeight
      , matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp
  }).map (data) ->
    vDOM.scrollableContent(data, scrollTopBus)

  vdomTreeProp = Bacon.combineWith (columns, scrollableContent, bodyHeight) ->
    vDOM.rootNode [
      vDOM.header(columns)
      scrollableContent
      vDOM.resizeHandle(bodyHeight, bodyHeightBus)
    ], {onclick: -> focusBus.push undefined}
  , columnsProp, scrollableContentProp, bodyHeightProp

  initialTree = vDOM.rootNode()
  renderProp = Bacon.update {
    el   : createElement(initialTree)
    tree : initialTree
  },
    [vdomTreeProp.toEventStream()], ({el, tree}, newTree) ->
      return {
        el   : patch(el, diff(tree, newTree))
        tree : newTree
      }
    [selectedItemProp.changes()], R.tap (current, ...) ->
      # Scroll item into the view if outside the visible border and was triggered by selectItem change
      if selectedRow = current.el.querySelector('.is-selected')
        selectedRow.scrollIntoViewIfNeeded(false) # centerIfNeeded=false => croll minimal possible to avoid jumps
    [searchStream], R.tap (current, ...) ->
      current.el.querySelector('.tbody').scrollTop = 0 #return to top


  return {
    searchElementProp     : elementProp
    itemsElementProp      : renderProp.map('.el')
    resizedBodyHeightProp : bodyHeightProp
    selectedItemProp      : selectedItemProp
    abortStream           : abortStream
    openStream            : keyDownBus.filter keys.isEventCode('enter')
  }
