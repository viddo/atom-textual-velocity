{Disposable, CompositeDisposable} = require 'atom'
R                                 = require 'ramda'
Path                              = require 'path'
atoms                             = require './atom-streams'

module.exports =
class Panels
  constructor: ({search, items}) ->
    @disposables = new CompositeDisposable

    sideEffects = [
      search.elementProp.onValue @createSearchPanel
      items.elementProp.onValue @createItemsPanel
      items.resizedBodyHeightProp.debounce(500).onValue @saveResizedBodyHeight
      items.selectedItemProp.onValue @previewSelectedItem
      items.selectedItemProp.sampledBy(search.openStream).onValue @openSelectedItem

      @quickDoubleStream(search.abortStream).onValue R.pipe(
        @hideItemsPanel
        @hideSearchPanel
        -> atom.workspace.getActivePane()?.activate()
      )
      @quickDoubleStream(atoms.cancelCommand()).onValue R.pipe(
        @showItemsPanel,
        @showSearchPanel,
        @getSearchInput,
        (input) -> input.select() and input.focus()
      )
    ]
    @removeOnDispose(sideEffect) for sideEffect in sideEffects

  # filter a given stream to only trigger if tow event are triggered within 300ms (e.g. double-ESC)
  quickDoubleStream: (stream) ->
    stream.bufferWithTimeOrCount(300, 2).filter R.propEq('length', 2)

  getSearchInput: ->
    @searchPanel.getItem().querySelector('.search')

  hideSearchPanel: ->
    @searchPanel.hide()

  hideItemsPanel: ->
    @itemsPanel.hide()

  showItemsPanel: ->
    @itemsPanel.show()

  showSearchPanel: ->
    @searchPanel.show()

  createSearchPanel: (el) ->
    unless @itemsPanel
      @searchPanel = atom.workspace.addTopPanel(item: el)

  createItemsPanel: (el) ->
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
    unless typeof o.dispose is 'function'
      if typeof o is 'function'
        o = new Disposable(o)
      else
        throw new Error('must be a function')
    @disposables.add(o)

  dispose: ->
    @disposables.dispose()
    @disposables = null
    @itemsPanel?.destroy()
    @itemsPanel = null
    @searchPanel?.destroy()
    @searchPanel = null
