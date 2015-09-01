{Disposable, CompositeDisposable} = require 'atom'
R                                 = require 'ramda'
Path                              = require 'path'
atoms                             = require '../../atom-streams'

module.exports =
class Panel
  constructor: (notationalWindow) ->
    nw = notationalWindow;
    @disposables = new CompositeDisposable

    @add nw.elementProp.onValue @createTopPanel
    @add nw.resizedBodyHeightProp.debounce(500).onValue @saveResizedBodyHeight
    @add nw.selectedItemProp.onValue @previewSelectedItem
    @add nw.selectedItemProp.sampledBy(nw.openSelectedStream).onValue @openSelectedItem
    @add nw.hideStream.onValue R.pipe(@hideTopPanel, @activateTextEditor)

    @add atoms.cancelCommand().onValue R.pipe(@showTopPanel, @getSearchInput, @selectAndFocus)

  selectAndFocus: (input) ->
    input.select()
    input.focus()

  activateTextEditor: ->
    atom.workspace.getActivePane()?.activate()

  getSearchInput: ->
    @topPanel.getItem().querySelector('.search')

  hideTopPanel: ->
    @topPanel.hide()

  showTopPanel: ->
    @topPanel.show() unless @topPanel.isVisible()

  createTopPanel: (el) ->
    unless @topPanel
      @topPanel = atom.workspace.addTopPanel(item: el)

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

  add: (o) ->
    unless typeof o.dispose is 'function'
      if typeof o is 'function'
        o = new Disposable(o)
      else
        throw new Error('must be a function')
    @disposables.add(o)

  dispose: ->
    @disposables.dispose()
    @disposables = null
    @topPanel?.destroy()
    @topPanel = null
