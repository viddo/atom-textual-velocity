{Disposable, CompositeDisposable} = require 'atom'
R                                 = require 'ramda'
Path                              = require 'path'
atoms                             = require './atom-streams'

module.exports =
class Panels
  constructor: ({searchElementProp, itemsElementProp, resizedBodyHeightProp, selectedItemProp, resetStream, openStream}) ->
    @disposables = new CompositeDisposable

    @removeOnDispose(sideEffect) for sideEffect in [
      searchElementProp.onValue @createSearchPanel
      itemsElementProp.onValue  @createItemsPanel

      resizedBodyHeightProp.debounce(500).onValue @saveResizedBodyHeight

      selectedItemProp.onValue @previewSelectedItem
      selectedItemProp.sampledBy(openStream).onValue @openSelectedItem

      @doubleTapStream(resetStream).onValue =>
        @hideItemsPanel()
        @hideSearchPanel()
        atom.workspace.getActivePane()?.activate()

      @doubleTapStream(atoms.cancelCommand()).onValue =>
        @showItemsPanel()
        @showSearchPanel()
        @selectAndFocusSearchInput()
    ]

  selectAndFocusSearchInput: ->
    R.tap @selectAndfocus, @searchPanel.getItem()

  selectAndfocus: (el) ->
    el.select()
    el.focus()

  # filter a given stream to only trigger if tow event are triggered within 300ms (e.g. double-ESC)
  doubleTapStream: (stream) ->
    stream.bufferWithTimeOrCount(300, 2).filter R.propEq('length', 2)

  hideSearchPanel: ->
    @searchPanel.hide()

  hideItemsPanel: ->
    @itemsPanel.hide()

  showItemsPanel: ->
    @itemsPanel.show()

  showSearchPanel: ->
    @searchPanel.show()

  createSearchPanel: (el) =>
    unless @searchPanel
      @searchPanel = atom.workspace.addTopPanel(item: el)
      @selectAndFocusSearchInput()

  createItemsPanel: (el) =>
    unless @itemsPanel
      @itemsPanel = atom.workspace.addTopPanel(item: el)

  saveResizedBodyHeight: (newHeight) ->
    atom.config.set('atom-notational.bodyHeight', newHeight)

  previewSelectedItem: (selectedItem) ->
    # TODO: for now only preview files if the preview tabs are enabled
    if selectedItem and atom.config.get('tabs.usePreviewTabs')
      atom.workspace.open Path.join(selectedItem.projectPath, selectedItem.relPath), {
        activatePane: false # keep focus in the top-pane
      }

  openSelectedItem: (selectedItem) ->
    if selectedItem
      atom.workspace.open Path.join(selectedItem.projectPath, selectedItem.relPath)

  removeOnDispose: (o) ->
    unless Disposable.isDisposable(o)
      if typeof o is 'function'
        o = new Disposable(o)
      else
        throw new Error('must be a function')
    @disposables.add(o)

  dispose: ->
    @disposables.dispose()
    @disposables = null
    @searchPanel?.destroy()
    @searchPanel = null
    @itemsPanel?.destroy()
    @itemsPanel = null
