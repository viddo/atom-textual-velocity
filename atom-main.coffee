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
    atomAdaptions = notationalItems()

    notationalPanel = setupPanel(
      itemsProp: atomAdaptions.itemsProp
      columnsProp: atomAdaptions.columnsProp
      bodyHeightStream: atoms.fromConfig('atom-notational.bodyHeight')
      rowHeightStream: atoms.fromConfig('atom-notational.rowHeight')
      resetStream: atoms.fromCommand('atom-text-editor.atom-notational-search', 'atom-notational:reset')
      moveSelectedStream: atoms.fromCommand('.atom-notational-search', 'core:move-down').map(1)
        .merge(atoms.fromCommand('.atom-notational-search', 'core:move-up').map(-1))
    )

    @subscriptions.push.apply(@subscriptions, [
      atomAdaptions
      notationalPanel

      # Side effects
      # Create panel 1st time the element is created
      notationalPanel.elementProp.onValue (el) =>
        @panel = atom.workspace.addTopPanel(item: el) unless @panel

      # Persist resized body height
      notationalPanel.resizedBodyHeightProp.debounce(500).onValue (newHeight) ->
        atom.config.set('atom-notational.bodyHeight', newHeight)

      # Handle selected item
      notationalPanel.selectedItemProp.onValue (selectedItem) ->
        if selectedItem
          console.info selectedItem
    ])

  deactivate: ->
    unsubscribe() for unsubscribe in @subscriptions
    @panel?.destroy()
