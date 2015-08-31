{CompositeDisposable, Disposable, Task} = require 'atom'
Bacon                                   = require 'baconjs'
Path                                    = require 'path'
atoms                                   = require './src/atom/streams'
createPanel                             = require './src/notational/create-panel'
NotationalItems                         = require './src/atom/notational-items'

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
    @tasks = {}

    searchBus = new Bacon.Bus()
    projectsPaths = atoms.projectsPaths()
    watchPathsStream = projectsPaths.addedStream.map(@createWatchPathTask.bind(this))
    atomAdaptions = new NotationalItems(
      searchStream        : searchBus
      addItemsStream      : watchPathsStream.flatMap (task) -> Bacon.fromEvent(task, 'add')
      removeItemsStream   : watchPathsStream.flatMap (task) -> Bacon.fromEvent(task, 'unlink')
      closeProjectsStream : projectsPaths.removedStream.map(@destroyWatchPathTask.bind(this))
    )

    panel = createPanel(
      matchedItemsProp : atomAdaptions.matchedItemsProp
      columnsProp      : atomAdaptions.columnsProp
      searchBus        : searchBus
      rowHeightProp    : atoms.fromConfig('atom-notational.rowHeight').toProperty()
      bodyHeightStream : atoms.fromConfig('atom-notational.bodyHeight')
    )

    # Side effects
    @disposableAdds [
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
      atoms.cancelCommand().onValue =>
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

  createWatchPathTask: (path) ->
    @tasks[path] = task = new Task(require.resolve('./src/atom/watch-project-task.coffee'))
    task.projectPath = path # projectPath to match src/atom/watch-project-task.coffee definition
    task.start(path,
      atom.config.get('core.ignoredNames'),
      atom.config.get('core.excludeVcsIgnoredPaths')
    )
    return task

  destroyWatchPathTask: (path) ->
    task = @tasks[path]
    task.send('dispose')
    return task

  deactivate: ->
    for path, task of @tasks
      @destroyPathWatchTask(path)
    @tasks = null
    @disposables.dispose()
    @topPanel?.destroy()
    @topPanel = null
