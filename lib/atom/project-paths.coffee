Bacon = require('baconjs')
atomStreams = require('./streams.coffee')

filteredPathsStream = (pairwisePathsStream, filterFn) ->
  pairwisePathsStream.flatMap (pair) ->
    Bacon.sequentially(0, filterFn(pair))

module.exports = ->
  lastProjectPathsProp = Bacon.sequentially(0, [ [], atom.project.getPaths() ])
    .merge(atomStreams.fromDisposable(atom.project, 'onDidChangePaths'))
    .slidingWindow(2, 2)

  addStream = filteredPathsStream lastProjectPathsProp, ([currentPaths, newPaths]) ->
    newPaths.filter (path) -> currentPaths.indexOf(path) < 0

  removeStream = filteredPathsStream lastProjectPathsProp, ([currentPaths, newPaths]) ->
    currentPaths.filter (path) -> newPaths.indexOf(path) < 0

  return {
    addStream: addStream
    removeStream: removeStream
  }
