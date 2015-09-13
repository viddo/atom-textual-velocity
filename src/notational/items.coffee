Bacon                          = require 'baconjs'
R                              = require 'ramda'
createElement                  = require 'virtual-dom/create-element'
diff                           = require 'virtual-dom/diff'
patch                          = require 'virtual-dom/patch'
vDom                           = require './vDom'
Keys                           = require './keys'
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
  resetStream        = keyDownBus.filter Keys.isKey('esc')
  selectPrevStream   = keyDownBus.filter(Keys.isKey('up')).doAction(preventDefault)
  selectNextStream   = keyDownBus.filter(Keys.isKey('down')).doAction(preventDefault)
  moveSelectedStream = selectPrevStream.map(-1).merge(selectNextStream.map(1))

  vDomTree = vDom.rootNode vDom.search(inputBus, keyDownBus)
  elementProp = Bacon.update createElement(vDomTree),
    [focusBus], R.tap (el) ->
      el.querySelector('.search').focus()
    [resetStream], R.tap (el) =>
      el.querySelector('.search').value = ''

  inputValueStream = inputBus.map('.target.value')
  searchStream = inputValueStream.merge resetStream.map('')
  searchBus.plug(searchStream)

  selectedItemProp = Bacon.update(undefined,
    [searchStream], R.always(undefined)
    [selectItemBus], R.nthArg(-1)
    [moveSelectedStream, matchedItemsProp], selectItemByRelativeOffset
  ).skipDuplicates()

  # Setup props related to the scrollable content
  rowHeightProp = Bacon.constant(25)
  bodyHeightProp = bodyHeightBus.merge(bodyHeightStream)
    .skipDuplicates()
    .filter R.lt(0)
    .toProperty(100)

  scrollTopProp = Bacon.update 0,
    [scrollTopBus], R.nthArg(-1)
    [selectedItemProp.changes(), matchedItemsProp, rowHeightProp, bodyHeightProp], adjustScrollTopForSelectedItem

  visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0
  , scrollTopProp, rowHeightProp

  visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
  , visibleBeginProp, bodyHeightProp, rowHeightProp

  # Setup vDom of scrollable content
  contentProp = Bacon.combineTemplate({
    columns: columnsProp
    selectedItem: selectedItemProp
    reverseStripes: visibleBeginProp.map R.modulo(R.__, 2)
    items: Bacon.combineWith(R.slice, visibleBeginProp, visibleEndProp, matchedItemsProp)
  }).map (data) ->
    vDom.content(data, selectItemBus)

  scrollableContentProp = Bacon.combineTemplate({
    bodyHeight: bodyHeightProp
    scrollTop: scrollTopProp
    content: contentProp
    topOffset: Bacon.combineWith(R.pipe(R.modulo, R.negate), scrollTopProp, rowHeightProp)
    marginBottom: Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
        items.length * rowHeight - scrollTop - bodyHeight
      , matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp
  }).map (data) ->
    vDom.scrollableContent(data, scrollTopBus)

  vDomTreeProp = Bacon.combineWith (columns, scrollableContent, bodyHeight) ->
    vDom.rootNode [
      vDom.header(columns)
      scrollableContent
      vDom.resizeHandle(bodyHeight, bodyHeightBus)
    ], {onclick: -> focusBus.push()}
  , columnsProp, scrollableContentProp, bodyHeightProp

  initialTree = vDom.rootNode()
  renderProp = Bacon.update {
    el   : createElement(initialTree)
    tree : initialTree
  },
    [vDomTreeProp.toEventStream()], ({el, tree}, newTree) ->
      return {
        el   : patch(el, diff(tree, newTree))
        tree : newTree
      }
    [selectedItemProp.changes()], R.tap (current) ->
      # Scroll item into the view if outside the visible border and was triggered by selectItem change
      if selectedRow = current.el.querySelector('.is-selected')
        selectedRow.scrollIntoViewIfNeeded(false) # centerIfNeeded=false => croll minimal possible to avoid jumps
    [searchStream], R.tap (current) ->
      current.el.querySelector('.tbody').scrollTop = 0 #return to top

  return {
    searchElementProp     : elementProp
    itemsElementProp      : renderProp.map('.el')
    resizedBodyHeightProp : bodyHeightProp
    selectedItemProp      : selectedItemProp
    resetStream           : resetStream
    openStream            : keyDownBus.filter Keys.isKey('enter')
  }
