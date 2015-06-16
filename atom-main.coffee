{CompositeDisposable, Disposable} = require 'atom'
Bacon                             = require 'baconjs'
atoms                             = require './src/atom/streams'
setupPanel                        = require './src/notational/setup-panel'
notationalItems                   = require './src/atom/notational-items'
focusStream                       = require './src/atom/focus-stream'
Path                              = require 'path'

module.exports =
  panel       : undefined
  disposables : undefined

  config:
    bodyHeight:
      type    : 'number'
      default : 200
      minimum : 0
    rowHeight:
      type    : 'number'
      default : 25
      minimum : 0


  activate: (state) ->
    @disposables  = new CompositeDisposable
    atomAdaptions = notationalItems()

    notationalPanel = setupPanel(
      matchedItemsProp : atomAdaptions.matchedItemsProp
      searchBus        : atomAdaptions.searchBus
      columnsProp      : atomAdaptions.columnsProp
      bodyHeightStream : atoms.fromConfig('atom-notational.bodyHeight')
      rowHeightStream  : atoms.fromConfig('atom-notational.rowHeight')
    )

    # Side effects
    @disposableAdds [
      atomAdaptions
      notationalPanel

      # Create panel 1st time the element is created
      notationalPanel.elementProp.onValue (el) =>
            @panel = atom.workspace.addTopPanel(item: el) unless @panel

      # Persist resized body height
      notationalPanel.resizedBodyHeightProp.debounce(500).onValue (newHeight) ->
        atom.config.set('atom-notational.bodyHeight', newHeight)

      # Handle selected item
      notationalPanel.selectedItemProp.onValue (selectedItem) ->
        # TODO: for now only preview files if the preview tabs are enabled
        if atom.config.get('tabs.usePreviewTabs') and selectedItem
          atom.workspace.open Path.join(selectedItem.projectPath, selectedItem.relPath), {
            activatePane: false # keep focus in the top-pane
          }

      # Open item on selected event
      # TODO: move sampleBy inside panel?
      notationalPanel.selectedItemProp.sampledBy(notationalPanel.openSelectedStream).onValue (selectedItem) ->
        if selectedItem
          atom.workspace.open Path.join(selectedItem.projectPath, selectedItem.relPath)

      # Hide panel on hide evnt
      notationalPanel.hideStream.onValue =>
        @panel.hide()
        atom.workspace.getActivePane()?.activate()

      # Show panel and focus on input on event
      focusStream().onValue =>
        @panel.show() unless @panel.isVisible()
        input = @panel.getItem().querySelector('.search')
        input.select()
        input.focus()
    ]


  disposableAdds: (disposalActions) ->
    @disposableAdd(fn) for fn in disposalActions

  disposableAdd: (disposalAction) ->
    throw new Error('must be a function') if typeof disposalAction isnt 'function'
    @disposables.add new Disposable(disposalAction)


  deactivate: ->
    @disposables.dispose()
    @panel?.destroy()
    @panel = null
