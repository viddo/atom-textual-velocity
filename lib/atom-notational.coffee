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
    bodyHeightProp = fromAtomConfig('bodyHeight').toProperty()
    rowHeightProp = fromAtomConfig('rowHeight').toProperty()
    scrollTopBus = new Bacon.Bus()
    scrollTopProp = scrollTopBus.toProperty(0)
    matchingItemsBus = new Bacon.Bus()
    matchingItemsProp = matchingItemsBus.toProperty (for i in [1..100]
      {
        title: "item #{i}"
        dateCreated: new Date
        dateModified: new Date
      })

    # Application props
    visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
      (scrollTop / rowHeight) | 0
    , scrollTopProp, rowHeightProp
    visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
      begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
    , visibleBeginProp, bodyHeightProp, rowHeightProp
    topOffsetProp = Bacon.combineWith (scrollTop, rowHeight) ->
      -(scrollTop % rowHeight)
    , scrollTopProp, rowHeightProp
    marginBottom = Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
      items.length * rowHeight - scrollTop - bodyHeight
    , matchingItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp
    visibleItemsProp = Bacon.combineWith (items, begin, end) ->
      items.slice(begin, end)
    , matchingItemsProp, visibleBeginProp, visibleEndProp
    reverseStripesProp = visibleBeginProp.map (begin) -> begin % 2 == 0

    # Side effects, setup tree rendering
    renderedTree = Bacon.combineTemplate({
      items: visibleItemsProp
      bodyHeight: bodyHeightProp
      rowHeight: rowHeightProp
      scrollTop: scrollTopProp
      topOffset: topOffsetProp
      reverseStripes: reverseStripesProp
      marginBottom: marginBottom
    }).map (data) ->
      renderRoot data, {
        scrollTopBus: scrollTopBus
      }

    @app = new App(renderedTree)


  deactivate: ->
    @app.dispose()
