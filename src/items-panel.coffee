Bacon         = require 'baconjs'
createElement = require 'virtual-dom/create-element'
diff          = require 'virtual-dom/diff'
patch         = require 'virtual-dom/patch'
vDOM          = require './vdom'

module.exports =
class ItemsPanel

  constructor: ({matchedItemsProp, searchBus, focusBus, moveSelectedStream, columnsProp, rowHeightStream, bodyHeightStream}) ->
    bodyHeightBus = new Bacon.Bus()
    scrollTopBus  = new Bacon.Bus()
    selectItemBus = new Bacon.Bus()

    @selectedItemProp = Bacon.update(undefined,
      [searchBus], -> undefined
      [selectItemBus], (..., newItem) -> newItem
      [moveSelectedStream, matchedItemsProp], @selectItemByRelativeOffset
    ).skipDuplicates()

    # Setup props related to the scrollable content
    rowHeightProp = rowHeightStream.toProperty(25)
    @bodyHeightProp = bodyHeightBus.merge(bodyHeightStream)
      .skipDuplicates()
      .filter (height) -> height > 0
      .toProperty(100)

    scrollTopProp = Bacon.update 0,
      [scrollTopBus], (..., scrollTop) -> scrollTop
      [@selectedItemProp.changes(), matchedItemsProp, rowHeightProp, @bodyHeightProp], @adjustScrollTopForSelectedItem

    visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
      (scrollTop / rowHeight) | 0
    , scrollTopProp, rowHeightProp

    visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
      begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
    , visibleBeginProp, @bodyHeightProp, rowHeightProp

    # Setup vdom of scrollable content
    scrollableContentProp = Bacon.combineTemplate({
      bodyHeight: @bodyHeightProp
      scrollTop: scrollTopProp
      content: Bacon.combineTemplate({
          columns: columnsProp
          selectedItem: @selectedItemProp
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
        , matchedItemsProp, rowHeightProp, scrollTopProp, @bodyHeightProp
    }).map (data) ->
      vDOM.scrollableContent(data, scrollTopBus)

    vdomTreeProp = Bacon.combineWith (columns, scrollableContent, bodyHeight) ->
      vDOM.rootNode [
        vDOM.header(columns)
        scrollableContent
        vDOM.resizeHandle(bodyHeight, bodyHeightBus)
      ], {onclick: -> focusBus.push undefined}
    , columnsProp, scrollableContentProp, @bodyHeightProp

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
      [@selectedItemProp.changes()], (current, ...) ->
        # Scroll item into the view if outside the visible border and was triggered by selectItem change
        if selectedRow = current.el.querySelector('.is-selected')
          selectedRow.scrollIntoViewIfNeeded(false) # centerIfNeeded=false => croll minimal possible to avoid jumps
        return current
      [searchBus], (current, ...) ->
        current.el.querySelector('.tbody').scrollTop = 0 #return to top
        return current

    @elementProp = renderProp.map('.el')
    @resizedBodyHeightProp = @bodyHeightProp


  selectItemByRelativeOffset: (currentItem, relativeOffset, items) ->
    offset = items.indexOf(currentItem) + relativeOffset
    return items[switch
      when currentItem and offset < 0 then 0                # stay on 1st item if has a selected item
      when offset < 0                 then items.length - 1 # cycle to last item
      when offset >= items.length     then offset - 1       # stay on last item
      else                                 offset           # offset is within bounds, just pass it
    ]

  adjustScrollTopForSelectedItem: (currentScrollTop, selectedItem, items, rowHeight, bodyHeight) ->
    return currentScrollTop unless selectedItem

    selectedScrollTop = items.indexOf(selectedItem) * rowHeight

    if currentScrollTop > selectedScrollTop
      # selected item is located before the visible bounds
      # from: .X..[...]....
      # to:   .[X..].......
      selectedScrollTop
    else if currentScrollTop + bodyHeight <= selectedScrollTop
      # selected item is located after the visible bounds
      # from: ....[...]..X.
      # to:   .......[..X].
       selectedScrollTop - bodyHeight + rowHeight
    else
      # selected item is located within the visible bounds, just return the current scrollTop value
      currentScrollTop
