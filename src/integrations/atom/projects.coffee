{Task} = require 'atom'
Bacon  = require 'baconjs'
R      = require 'ramda'
atoms  = require '../../atom-streams'

module.exports =
class Projects
  constructor: (searchStream) ->
    @tasks = {}
    searchProp = searchStream.skipDuplicates().toProperty('')
    @matchedItemsProp = Bacon.combineWith(@filterItemsBySearch, @createItemsProp(), searchProp)

  filterItemsBySearch: (items, searchStr) ->
    return items unless searchStr
    items.filter (item) ->
      item.relPath.toLowerCase().search(searchStr.toLowerCase()) isnt -1

  createItemsProp: ->
    projectsPaths       = atoms.projectsPaths()
    watchPathsStream    = projectsPaths.openStream.map(@createWatchPathTask.bind(this))
    addItemsStream      = watchPathsStream.flatMap (task) -> Bacon.fromEvent(task, 'add')
    removeItemsStream   = watchPathsStream.flatMap (task) -> Bacon.fromEvent(task, 'unlink')
    closeProjectsStream = projectsPaths.closeStream.map(@destroyWatchPathTask.bind(this))

    return Bacon.update [],
      [addItemsStream], @concatNewItem
      [removeItemsStream], (items, item) ->
        items.filter R.compose(R.not, R.eqProps('relPath', item, R.__))
      [closeProjectsStream], (items, item) ->
        items.filter R.compose(R.not, R.eqProps('projectPath', item, R.__))

  concatNewItem: R.flip(R.invoker(1, 'concat'))

  createWatchPathTask: (path) ->
    @tasks[path] = task = new Task(require.resolve('./watch-project-task.coffee'))
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

  dispose: ->
    for path, task of @tasks
      @destroyPathWatchTask(path)
    @tasks = null
    @matchedItemsProp = null
