Bacon         = require 'baconjs'
R             = require 'ramda'
createElement = require 'virtual-dom/create-element'
diff          = require 'virtual-dom/diff'
patch         = require 'virtual-dom/patch'
vDom          = require './vDom'
Beh           = require './behaviors.coffee'

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

  vDomTree = vDom.rootNode(vDom.search(inputBus, keyDownBus))
  tapSearchInput = (fn) ->
    R.tap R.pipe(Beh.findElement('.search'), fn)
  searchElementProp = Bacon.update createElement(vDomTree),
    [focusBus],    tapSearchInput (el) -> el.focus()
    [resetStream], tapSearchInput (el) -> el.value = ''

  inputValueStream = inputBus.map('.target.value')
  searchStream = inputValueStream.merge resetStream.map('')
  searchBus.plug(searchStream)

  selectedItemProp = Bacon.update(undefined,
    [searchStream], R.always(undefined)
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
    columns: columnsProp
    selectedItem: selectedItemProp
    reverseStripes: visibleBeginProp.map Beh.isEven
    items: Bacon.combineWith(R.slice, visibleBeginProp, visibleEndProp, matchedItemsProp)
  }).map (data) ->
    vDom.content(data, selectItemBus)

  scrollableContentProp = Bacon.combineTemplate({
    bodyHeight: bodyHeightProp
    scrollTop: scrollTopProp
    content: contentProp
    topOffset: Bacon.combineWith(R.pipe(R.modulo, R.negate), scrollTopProp, rowHeightProp)
    marginBottom: Bacon.combineWith [matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp], (items, rowHeight, scrollTop, bodyHeight) ->
      items.length * rowHeight - scrollTop - bodyHeight
  }).map (data) ->
    vDom.scrollableContent(data, scrollTopBus)

  vDomTreeProp = Bacon.combineWith [columnsProp, scrollableContentProp, bodyHeightProp], (columns, scrollableContent, bodyHeight) ->
    vDom.rootNode [
      vDom.header(columns)
      scrollableContent
      vDom.resizeHandle(bodyHeight, bodyHeightBus)
    ], {onclick: -> focusBus.push()}

  renderResult = (el, tree) ->
    el   : el
    tree : tree
  tapResultElement = (selector, fn) ->
    R.tap R.pipe(R.prop('el'), Beh.findElement(selector), fn)
  initialTree = vDom.rootNode()
  renderProp = Bacon.update renderResult(createElement(initialTree), initialTree),
    [vDomTreeProp.toEventStream()], ({el, tree}, newTree) ->
      newEl = patch(el, diff(tree, newTree))
      renderResult(newEl, newTree)
    [selectedItemProp.changes()], tapResultElement '.is-selected', (el) ->
      # Scroll item into the view if outside the visible border and was triggered by selectItem change
      el?.scrollIntoViewIfNeeded(false) # centerIfNeeded=false => croll minimal possible to avoid jumps
    [searchStream], tapResultElement '.tbody', (el) ->
      el.scrollTop = 0 # return to top

  return {
    searchElementProp     : searchElementProp
    itemsElementProp      : renderProp.map('.el')
    resizedBodyHeightProp : bodyHeightProp
    selectedItemProp      : selectedItemProp
    resetStream           : resetStream
    openStream            : keyDownBus.filter Beh.isEventKey('enter')
  }
