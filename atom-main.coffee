{CompositeDisposable, Disposable} = require 'atom'
Bacon = require 'baconjs'
atoms = require './src/atom/streams.coffee'
setupPanel = require './src/notational/setup-panel.coffee'
notationalItems = require './src/atom/notational-items.coffee'
remote = require 'remote'
toggleShortcut = 'cmd+alt+space'

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
      itemsProp: atomAdaptions.itemsProp
      columnsProp: atomAdaptions.columnsProp
      bodyHeightStream: atoms.fromConfig('atom-notational.bodyHeight')
      rowHeightStream: atoms.fromConfig('atom-notational.rowHeight')
      resetStream: atoms.fromCommand('atom-text-editor.atom-notational-search', 'atom-notational:reset')
      moveSelectedStream: atoms.fromCommand('.atom-notational-search', 'core:move-down').map(1)
        .merge(atoms.fromCommand('.atom-notational-search', 'core:move-up').map(-1))
    )

    @disposables.add atomAdaptions
    @disposables.add notationalPanel

    # Side effects
    # Create panel 1st time the element is created
    @disposableAdd notationalPanel.elementProp.onValue (el) =>
      @panel = atom.workspace.addTopPanel(item: el) unless @panel
      @disposableAdd @panel.onDidChangeVisible (visible) =>
        if visible then @panel.getItem().querySelector('.atom-notational-search').focus()

    # Persist resized body height
    @disposableAdd notationalPanel.resizedBodyHeightProp.debounce(500).onValue (newHeight) ->
      atom.config.set('atom-notational.bodyHeight', newHeight)

    # Handle selected item
    @disposableAdd notationalPanel.selectedItemProp.onValue (selectedItem) ->
      if selectedItem
        console.info selectedItem

    # Handle panel
    @disposables.add atom.commands.add 'atom-workspace', 'atom-notational:toggle-panel', =>
      if @panel.isVisible()
        @panel.hide()
      else
        @panel.show()
        @panel.getItem().querySelector('.atom-notational-search').focus()

    @disposables.add atom.commands.add 'atom-workspace', 'atom-notational:focus', =>
      @panel.show() unless @panel.isVisible()
      @panel.getItem().querySelector('.atom-notational-search').focus()

    # global shortcut
    globalShortcut = remote.require('global-shortcut')
    ret = globalShortcut.register toggleShortcut, ->
      if atom.getCurrentWindow().isFocused()
        atom.hide()
      else
        atom.show()
        atom.focus()
        target = document.body.querySelector('atom-workspace')
        atom.commands.dispatch(target, 'atom-notational:focus')
    console.warn "could not reg #{toggleShortcut}" unless ret

    window.addEventListener 'beforeunload', ->
      console.info 'unloading…'
      if globalShortcut.isRegistered(toggleShortcut)
        globalShortcut.unregister(toggleShortcut)


  disposableAdd: (disposalAction) ->
    new Disposable(disposalAction)


  deactivate: ->
    console.info 'deactivating…'
    @disposables.dispose()
    @panel?.destroy()
