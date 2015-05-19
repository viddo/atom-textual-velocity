{Task} = require 'atom'
Bacon = require 'baconjs'
atoms = require './streams.coffee'
PreviewEditor = require './preview-editor.coffee'
projects = require '../src/observables/projects.coffee'
vdomTree = require '../src/observables/vdom-tree.coffee'
rootNode = require '../src/observables/root-node.coffee'
Path = require 'path'

module.exports =
  panel: undefined
  deactivateBus: undefined
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
    @deactivateBus = new Bacon.Bus()

    { addedStream, removedStream } = atoms.projectsPaths()

    watchedProjectsStream = addedStream.map (path) ->
      task = new Task(require.resolve('./watch-project-task.coffee'))
      task.start(
        path,
        atom.config.get('core.ignoredNames'),
        atom.config.get('core.excludeVcsIgnoredPaths')
      )
      return {
        path: path
        task: task
      }

    projectsProp = projects(watchedProjectsStream, removedStream)

    bodyHeightBus = new Bacon.Bus()
    selectedItemBus = new Bacon.Bus()

    rootNodeProp = rootNode vdomTree({
        bodyHeightStream: atoms.fromConfig('atom-notational.bodyHeight').merge(bodyHeightBus)
        rowHeightStream: atoms.fromConfig('atom-notational.rowHeight')
        removedProjectStream: removedStream
        addItemsStream: watchedProjectsStream.flatMap ({ task }) ->
          Bacon.fromEvent(task, 'add')
        removeItemsStream: watchedProjectsStream.flatMap ({ task }) ->
          Bacon.fromEvent(task, 'unlink')
        moveSelectedStream:
          atoms.fromDisposable(atom.commands, 'add', '.atom-notational-search', 'core:move-down').map(1)
          .merge(
            atoms.fromDisposable(atom.commands, 'add', '.atom-notational-search', 'core:move-up').map(-1)
          )
      }, {
        scrollTopBus: new Bacon.Bus()
        searchBus: new Bacon.Bus()
        bodyHeightBus: bodyHeightBus
        selectedItemBus: selectedItemBus
      })


    # Preview handling, WIP
    previewExt = '.nvpreview'
    @previewOpener = atom.workspace.addOpener (uri) =>
      if Path.extname(uri) is previewExt
        unless @previewEditor
          @previewEditor = new PreviewEditor()
          @previewEditor.onDidDestroy =>
            selectedItemBus.push(undefined)
            @previewEditor = null
        filePath = uri.replace(previewExt, '')
        @previewEditor.setText filePath
        @previewEditor.getBuffer().setPath uri
        return @previewEditor


    # Side effects
    @subscriptions.push(
      rootNodeProp.map (rootNode) ->
        rootNode.querySelector('.is-selected')
      .filter (ifAnySelected) -> ifAnySelected
      .onValue (selectedRow) ->
        # Scroll item into the view if outside the visible border
        selectedRow.scrollIntoViewIfNeeded(false) # false=only scroll the minimal necessary
    )

    @subscriptions.push rootNodeProp.onValue (rootNode) =>
      unless @panel
        @panel = atom.workspace.addTopPanel {
          item: rootNode
        }

    @subscriptions.push bodyHeightBus.debounce(500).onValue (newHeight) ->
      atom.config.set('atom-notational.bodyHeight', newHeight)

    @subscriptions.push selectedItemBus.filter((item) -> item).onValue (item) ->
      atom.workspace.open Path.join(item.projectPath, item.relPath) + previewExt, searchAllPanes: true

    @subscriptions.push atom.workspace.onDidOpen ({item}) =>
      if item instanceof PreviewEditor
        @panel.getItem().querySelector('.atom-notational-search').focus()

    terminateProjectsProp = projectsProp.sampledBy(@deactivateBus)
    terminateProjectsProp.onValue (projects) ->
      for { task } in projects
        task.send('finish')
      return Bacon.noMore


  deactivate: ->
    @previewOpener.dispose()
    @deactivateBus.push(true)
    unsubscribe() for unsubscribe in @subscriptions
    @panel?.destroy()
