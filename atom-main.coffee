Bacon = require 'baconjs'
atoms = require './src/atom/streams.coffee'
setupPanel = require './src/notational/setup-panel.coffee'
notationalItems = require './src/atom/notational-items.coffee'

module.exports =
  panel: undefined
  subscriptions: []

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
    @subscriptions.push atomAdaptions = notationalItems()

    @subscriptions.push notationalPanel = setupPanel(
      itemsProp: atomAdaptions.itemsProp
      columnsProp: atomAdaptions.columnsProp
      bodyHeightStream: atoms.fromConfig('atom-notational.bodyHeight')
      rowHeightStream: atoms.fromConfig('atom-notational.rowHeight')
      moveSelectedStream: atoms.fromCommand('.atom-notational-search', 'core:move-down').map(1)
        .merge(atoms.fromCommand('.atom-notational-search', 'core:move-up').map(-1))
    )

    # Side effects
    # Create panel 1st time the element is created
    @subscriptions.push notationalPanel.elementProp.onValue (el) =>
      @panel = atom.workspace.addTopPanel(item: el) unless @panel

    # Persist resized body height
    @subscriptions.push notationalPanel.resizedBodyHeightProp.debounce(500).onValue (newHeight) ->
      atom.config.set('atom-notational.bodyHeight', newHeight)

    # Handle selected item
    @subscriptions.push notationalPanel.selectedItemProp.onValue (selectedItem) ->
      console.info selectedItem


  deactivate: ->
    unsubscribe() for unsubscribe in @subscriptions
    @panel?.destroy()
