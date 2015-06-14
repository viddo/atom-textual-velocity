{CompositeDisposable, Disposable} = require 'atom'
Bacon = require 'baconjs'
atoms = require './src/atom/streams'
setupPanel = require './src/notational/setup-panel'
notationalItems = require './src/atom/notational-items'
focusStream = require './src/atom/focus-stream'
Path = require 'path'

module.exports =
  panel: undefined
  disposables: undefined

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
    @disposables = new CompositeDisposable
    atomAdaptions = notationalItems()

    notationalPanel = setupPanel(
      matchedItemsProp: atomAdaptions.matchedItemsProp
      searchBus: atomAdaptions.searchBus
      columnsProp: atomAdaptions.columnsProp
      bodyHeightStream: atoms.fromConfig('atom-notational.bodyHeight')
      rowHeightStream: atoms.fromConfig('atom-notational.rowHeight')
    )

    @disposableAdd atomAdaptions
    @disposableAdd notationalPanel

    # Side effects
    # Create panel 1st time the element is created
    @disposableAdd notationalPanel.elementProp.onValue (el) =>
      @panel = atom.workspace.addTopPanel(item: el) unless @panel

    # Persist resized body height
    @disposableAdd notationalPanel.resizedBodyHeightProp.debounce(500).onValue (newHeight) ->
      atom.config.set('atom-notational.bodyHeight', newHeight)

    # Handle selected item
    @disposableAdd notationalPanel.selectedItemProp.onValue (selectedItem) ->
      # TODO: for now only preview files if the preview tabs are enabled
      if atom.config.get('tabs.usePreviewTabs') and selectedItem
        atom.workspace.open Path.join(selectedItem.projectPath, selectedItem.relPath), {
          activatePane: false # keep focus in the top-pane
        }

    # TODO: move sampleBy inside panel?
    @disposableAdd notationalPanel.selectedItemProp.sampledBy(notationalPanel.openSelectedStream).onValue (selectedItem) ->
      if selectedItem
        atom.workspace.open Path.join(selectedItem.projectPath, selectedItem.relPath)

    # Handle panel
    @disposableAdd notationalPanel.hideStream.onValue =>
      @panel.hide()
      atom.workspace.getActivePane()?.activate()

    @disposableAdd focusStream().onValue =>
      @panel.show() unless @panel.isVisible()
      input = @panel.getItem().querySelector('.search')
      input.select()
      input.focus()


  disposableAdd: (disposalAction) ->
    @disposables.add new Disposable(disposalAction)


  deactivate: ->
    @disposables.dispose()
    @panel?.destroy()
    @panel = null
