Bacon   = require 'baconjs'
{Task}  = require 'atom'
Path    = require 'path'
atoms   = require './streams'
columns = require './columns'
R       = require 'ramda'

# @param {Stream} watchedProjectsStream objects containing a path {String} and a task {Task}
# @param {Stream} removedStream paths that are removed
# @return {Property} array of projects
createProjectsProp = (watchedProjectsStream, removedStream) ->
  Bacon.update [],
    [watchedProjectsStream], R.flip(R.invoker(1, 'concat'))
    [removedStream], (projects, removedPath) ->
      equalsRemovedPath = R.propEq('path', removedPath)
      removedProject = R.find(equalsRemovedPath, projects)
      if removedProject
        removedProject.task.send('dispose')
      projects.filter(R.compose(R.not equalsRemovedPath))

watchedProjects = (addedStream) ->
  addedStream.map (path) ->
    task = new Task(require.resolve('./watch-project-task.coffee'))
    task.start(path,
      atom.config.get('core.ignoredNames'),
      atom.config.get('core.excludeVcsIgnoredPaths')
    )
    return {
      path: path
      task: task
    }


module.exports = ->
  projectsPaths = atoms.projectsPaths()
  watchedProjectsStream = watchedProjects(projectsPaths.addedStream)

  deactivateBus = new Bacon.Bus()
  createProjectsProp(watchedProjectsStream, projectsPaths.removedStream)
    .sampledBy(deactivateBus)
    .onValue (projects) ->
      for {task} in projects
        task.send('dispose')
      return Bacon.noMore

  addItemsStream = watchedProjectsStream.flatMap ({task}) ->
    Bacon.fromEvent(task, 'add')
  removeItemsStream = watchedProjectsStream.flatMap ({task}) ->
    Bacon.fromEvent(task, 'unlink')

  dispose = ->
    deactivateBus.push('dispose')

  itemsProp = Bacon.update [],
    [addItemsStream], (items, newItem) ->
      items.concat(newItem)
    [removeItemsStream], (items, {relPath}) ->
      items.filter (item) ->
        item.relPath isnt relPath
    [projectsPaths.removedStream], (items, removedPath) ->
      items.filter ({projectPath}) ->
        projectPath isnt removedPath

  dispose.searchBus = new Bacon.Bus()
  searchProp = dispose.searchBus.map('.target.value').skipDuplicates().toProperty('')

  dispose.matchedItemsProp = Bacon.combineWith (items, searchStr) ->
    return items unless searchStr
    items.filter (item) ->
      item.relPath.toLowerCase().search(searchStr.toLowerCase()) isnt -1
  , itemsProp, searchProp

  dispose.columnsProp = Bacon.sequentially(0, [columns]).toProperty([])

  return dispose
