Bacon = require 'baconjs'

module.exports =

  fromDisposable: (obj, funcName, args...) ->
    Bacon.fromBinder (sink) ->
      args.push(sink)
      disposable = obj[funcName].apply(obj, args)
      return -> disposable.dispose()

  fromConfig: (key) ->
    @fromDisposable(atom.config, 'observe', key)

  fromCommand: (context, command) ->
    @fromDisposable(atom.commands, 'add', context, command)

  projectsPaths: ->
    lastProjectPathsProp = Bacon.sequentially(0, [ [], atom.project.getPaths() ])
      .merge(@fromDisposable(atom.project, 'onDidChangePaths'))
      .slidingWindow(2, 2)

    fromFilteredPairs = (pairwiseStream, predicate) ->
      pairwiseStream.flatMap (pair) ->
        Bacon.sequentially(0, predicate(pair))

    return {
      addedStream: fromFilteredPairs lastProjectPathsProp, ([currentPaths, newPaths]) ->
        newPaths.filter (path) ->
          currentPaths.indexOf(path) < 0

      removedStream: fromFilteredPairs lastProjectPathsProp, ([currentPaths, newPaths]) ->
        currentPaths.filter (path) ->
          newPaths.indexOf(path) < 0
    }

  # @param {Stream} watchedProjectsStream objects containing a path {String} and a task {Task}
  # @param {Stream} removedStream paths that are removed
  # @return {Property} array of projects
  projects: (watchedProjectsStream, removedStream) ->
    Bacon.update [],
      [watchedProjectsStream], (projects, project) ->
        projects.concat(project)
      [removedStream], (projects, removedPath) ->
        [removedProject] = projects.filter ({path}) ->
          path is removedPath
        removedProject.task.send('dispose') if removedProject
        projects.filter ({path}) ->
          path isnt removedPath
