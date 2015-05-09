Bacon = require 'baconjs'
atomStreams = require './streams.coffee'

filteredPathsStream = (pairwisePathsStream, filterFn) ->
  pairwisePathsStream.flatMap (pair) ->
    Bacon.fromArray filterFn(pair)

module.exports = ->
  pathsStream = atomStreams.fromDisposable atom.project, 'onDidChangePaths'
    .merge Bacon.fromArray [ [], atom.project.getPaths() ]
  lastProjectPathsProp = pathsStream.slidingWindow(2, 2)

  addStream = filteredPathsStream lastProjectPathsProp, ([currentPaths, newPaths]) ->
    newPaths.filter (path) -> currentPaths.indexOf(path) < 0

  removeStream = filteredPathsStream lastProjectPathsProp, ([currentPaths, newPaths]) ->
    currentPaths.filter (path) -> newPaths.indexOf(path) < 0

  return {
    addStream: addStream
    removeStream: removeStream
  }
