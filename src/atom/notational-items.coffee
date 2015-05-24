Bacon = require 'baconjs'
{Task} = require 'atom'
Path = require 'path'
{projectsPaths} = require './streams.coffee'
columns = require './columns.coffee'

# @param {Stream} watchedProjectsStream objects containing a path {String} and a task {Task}
# @param {Stream} removedStream paths that are removed
# @return {Property} array of projects
projects = (watchedProjectsStream, removedStream) ->
  Bacon.update [],
    [watchedProjectsStream], (projects, project) ->
      projects.concat(project)
    [removedStream], (projects, removedPath) ->
      [removedProject] = projects.filter ({path}) ->
        path is removedPath
      removedProject.task.send('dispose') if removedProject
      projects.filter ({path}) ->
        path isnt removedPath

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
  {addedStream, removedStream} = projectsPaths()
  watchedProjectsStream = watchedProjects(addedStream)

  deactivateBus = new Bacon.Bus()
  projects(watchedProjectsStream, removedStream)
    .sampledBy(deactivateBus)
    .onValue (projects) ->
      task.send('dispose') for {task} in projects
      return Bacon.noMore

  addItemsStream = watchedProjectsStream.flatMap ({task}) ->
    Bacon.fromEvent(task, 'add')
  removeItemsStream = watchedProjectsStream.flatMap ({task}) ->
    Bacon.fromEvent(task, 'unlink')

  return {
    itemsProp: Bacon.update [],
      [addItemsStream], (items, newItem) ->
        items.concat(newItem)
      [removeItemsStream], (items, {relPath}) ->
        items.filter (item) ->
          item.relPath isnt relPath
      [removedStream], (items, removedPath) ->
        items.filter ({projectPath}) ->
          projectPath isnt removedPath

    columnsProp: Bacon.sequentially(0, [columns]).toProperty([])

    disposeProjectWatchers: ->
      deactivateBus.push('dispose')
  }
