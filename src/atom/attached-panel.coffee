{Disposable, CompositeDisposable} = require 'atom'
R                                 = require 'ramda'
atoms                             = require './streams'

module.exports =
class AttachedPanel
  constructor: (panel) ->
    @disposables = new CompositeDisposable

    @add panel.elementProp.onValue @createTopPanel
    @add panel.resizedBodyHeightProp.debounce(500).onValue @saveResizedBodyHeight
    @add panel.selectedItemProp.onValue @previewSelectedItem
    @add panel.selectedItemProp.sampledBy(panel.openSelectedStream).onValue @openSelectedItem
    @add panel.hideStream.onValue R.pipe(@hideTopPanel, @activateTextEditor)

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
