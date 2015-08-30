Bacon   = require 'baconjs'
{Task}  = require 'atom'
Path    = require 'path'
atoms   = require './streams'
columns = require './columns'
R       = require 'ramda'

module.exports =
class NotationalItems

  constructor: ->
    projectsPaths = atoms.projectsPaths()
    watchedProjectsStream = projectsPaths.addedStream.map(@createWatchTaskForPath)

    @deactivateBus = new Bacon.Bus()
    @createProjectsProp(watchedProjectsStream, projectsPaths.removedStream)
      .sampledBy(@deactivateBus)
      .onValue (projects) ->
        for {task} in projects
          task.send('dispose')
        return Bacon.noMore

    addItemsStream = watchedProjectsStream.flatMap ({task}) ->
      Bacon.fromEvent(task, 'add')
    deletedItemsStream = watchedProjectsStream.flatMap ({task}) ->
      Bacon.fromEvent(task, 'unlink')

    itemsProp = Bacon.update [],
      [addItemsStream], @concatNewItem
      [deletedItemsStream], (items, item) ->
        items.filter R.compose(R.not, R.eqProps('relPath', item, R.__))
      [projectsPaths.removedStream], (items, removedPath) ->
        items.filter R.compose(R.not, R.equals(removedPath, R.__))

    @searchBus = new Bacon.Bus()
    searchProp = @searchBus.map('.target.value').skipDuplicates().toProperty('')

    @matchedItemsProp = Bacon.combineWith (items, searchStr) ->
      return items unless searchStr
      items.filter (item) ->
        item.relPath.toLowerCase().search(searchStr.toLowerCase()) isnt -1
    , itemsProp, searchProp

    @columnsProp = Bacon.sequentially(0, [columns]).toProperty([])

  dispose: ->
    @deactivateBus.push('dispose')

  # @param {Stream} watchedProjectsStream objects containing a path {String} and a task {Task}
  # @param {Stream} removedStream paths that are removed
  # @return {Property} array of projects
  createProjectsProp: (watchedProjectsStream, removedStream) ->
    Bacon.update [],
      [watchedProjectsStream], @concatNewItem
      [removedStream], (projects, removedPath) ->
        equalsRemovedPath = R.propEq('path', removedPath)
        removedProject = R.find(equalsRemovedPath, projects)
        if removedProject
          removedProject.task.send('dispose')
        projects.filter(R.compose(R.not equalsRemovedPath))

  createWatchTaskForPath: (path) ->
    task = new Task(require.resolve('./watch-project-task.coffee'))
    task.start(path,
      atom.config.get('core.ignoredNames'),
      atom.config.get('core.excludeVcsIgnoredPaths')
    )
    return {
      path: path
      task: task
    }

  # (items, item) -> items.concat(item)
  concatNewItem: R.flip(R.invoker(1, 'concat'))

