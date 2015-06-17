{CompositeDisposable, Disposable} = require 'atom'
Bacon                             = require 'baconjs'
atoms                             = require './src/atom/streams'
setupPanel                        = require './src/notational/setup-panel'
notationalItems                   = require './src/atom/notational-items'
focusStream                       = require './src/atom/focus-stream'
Path                              = require 'path'

module.exports =
  topPanel    : undefined
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

    panel = setupPanel(
      matchedItemsProp : atomAdaptions.matchedItemsProp
      searchBus        : atomAdaptions.searchBus
      columnsProp      : atomAdaptions.columnsProp
      bodyHeightStream : atoms.fromConfig('atom-notational.bodyHeight')
      rowHeightStream  : atoms.fromConfig('atom-notational.rowHeight')
    )

    # Side effects
    @disposableAdds [
      atomAdaptions
      panel.sideEffectsProp.onValue() # no-op, but enforce side-effects being setup

      # Create panel 1st time the element is created
      panel.elementProp.onValue (el) =>
            @topPanel = atom.workspace.addTopPanel(item: el) unless @topPanel

      # Persist resized body height
      panel.resizedBodyHeightProp.debounce(500).onValue (newHeight) ->
        atom.config.set('atom-notational.bodyHeight', newHeight)

      # Handle selected item
      panel.selectedItemProp.onValue (selectedItem) ->
        # TODO: for now only preview files if the preview tabs are enabled
        if atom.config.get('tabs.usePreviewTabs') and selectedItem
          atom.workspace.open Path.join(selectedItem.projectPath, selectedItem.relPath), {
            activatePane: false # keep focus in the top-pane
          }

      # Open item on selected event
      # TODO: move sampleBy inside panel?
      panel.selectedItemProp.sampledBy(panel.openSelectedStream).onValue (selectedItem) ->
        if selectedItem
          atom.workspace.open Path.join(selectedItem.projectPath, selectedItem.relPath)

      # Hide panel on hide evnt
      panel.hideStream.onValue =>
        @topPanel.hide()
        atom.workspace.getActivePane()?.activate()

      # Show panel and focus on input on event
      focusStream().onValue =>
        @topPanel.show() unless @topPanel.isVisible()
        input = @topPanel.getItem().querySelector('.search')
        input.select()
        input.focus()
    ]


  disposableAdds: (disposalActions) ->
    @disposableAdd(fn) for fn in disposalActions

  disposableAdd: (o) ->
    unless typeof o.dispose is 'function'
      if typeof o is 'function'
        o = new Disposable(o)
      else
        throw new Error('must be a function')

    @disposables.add(o)


  deactivate: ->
    @disposables.dispose()
    @topPanel?.destroy()
    @topPanel = null
