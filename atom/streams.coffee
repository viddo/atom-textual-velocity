Bacon = require('baconjs')

fromFilteredPairs = (pairwiseStream, predicate) ->
  pairwiseStream.flatMap (pair) ->
    Bacon.sequentially(0, predicate(pair))

module.exports = {

  fromDisposable: (obj, funcName, args...) ->
    Bacon.fromBinder (sink) ->
      args.push(sink)
      disposable = obj[funcName].apply(obj, args)
      return -> disposable.dispose()

  fromConfig: (key) ->
    @fromDisposable(atom.config, 'observe', key)

  projectsPaths: ->
    lastProjectPathsProp = Bacon.sequentially(0, [ [], atom.project.getPaths() ])
      .merge(@fromDisposable(atom.project, 'onDidChangePaths'))
      .slidingWindow(2, 2)

    return {
      addedStream: fromFilteredPairs lastProjectPathsProp, ([currentPaths, newPaths]) ->
        newPaths.filter (path) ->
          currentPaths.indexOf(path) < 0

      removedStream: fromFilteredPairs lastProjectPathsProp, ([currentPaths, newPaths]) ->
        currentPaths.filter (path) ->
          newPaths.indexOf(path) < 0
    }

}
