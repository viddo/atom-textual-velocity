Bacon = require 'baconjs'
App = require './app'
renderRoot = require './virtual-dom/root'

fromAtomConfig = (settingName) ->
  Bacon.fromBinder (sink) ->
    disposable = atom.config.observe "atom-notational.#{settingName}", sink
    return -> disposable.dispose()

module.exports =
  app: undefined

  config:
    bodyHeight:
      type: 'number'
      default: 200
      minimum: 0
    rowHeight:
      type: 'number'
      default: 25
      minimum: 0


  activate: (state) ->
    # Source streams
    bodyHeight = fromAtomConfig('bodyHeight').toProperty()
    rowHeight = fromAtomConfig('rowHeight').toProperty()
    scrollTopBus = new Bacon.Bus()
    scrollTop = scrollTopBus.toProperty(0)
    matchingItemsBus = new Bacon.Bus()
    matchingItems = matchingItemsBus.toProperty (for i in [1..100]
      {
        title: "item #{i}"
        dateCreated: new Date
        dateModified: new Date
      })

    # Application props
    beginOffset = Bacon.combineWith (scrollTop, rowHeight) ->
      (scrollTop / rowHeight) | 0
    , scrollTop, rowHeight
    endOffset = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
      begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
    , beginOffset, bodyHeight, rowHeight
    topOffset = Bacon.combineWith (scrollTop, rowHeight) ->
      -(scrollTop % rowHeight)
    , scrollTop, rowHeight
    marginBottom = Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
      items.length * rowHeight - scrollTop - bodyHeight
    , matchingItems, rowHeight, scrollTop, bodyHeight
    visibleItems = Bacon.combineWith (items, begin, end) ->
      items.slice(begin, end)
    , matchingItems, beginOffset, endOffset
    reverseStripes = beginOffset.map (begin) -> begin % 2 == 0

    # Side effects, setup tree rendering
    renderedTree = Bacon.combineTemplate({
      items: visibleItems
      bodyHeight: bodyHeight
      rowHeight: rowHeight
      scrollTop: scrollTop
      topOffset: topOffset
      reverseStripes: reverseStripes
      marginBottom: marginBottom
    }).map (data) ->
      renderRoot data, {
        scrollTopBus: scrollTopBus
      }

    @app = new App(renderedTree)


  deactivate: ->
    @app.dispose()
