'use babel'

import Bacon from 'baconjs'

let atomStream = (obj, funcName, ...args) => {
  return Bacon.fromBinder(sink => {
    args.push(sink)
    let disposable = obj[funcName].apply(obj, args)
    return () => disposable.dispose()
  })
}

let commandStream = (context, command) => {
  return atomStream(atom.commands, 'add', context, command)
}

export default {
  stream: atomStream,
  commandStream: commandStream,

  configStream (key) {
    return atomStream(atom.config, 'observe', key)
  },

  projectsPathsStreams () {
    let lastProjectPathsProp = Bacon.sequentially(0, [[], atom.project.getPaths()])
      .merge(atomStream(atom.project, 'onDidChangePaths'))
      .slidingWindow(2, 2)

    let fromFilteredPairs = (pairwiseStream, predicate) => {
      return pairwiseStream.flatMap(pair =>
        Bacon.sequentially(0, predicate(pair))
      )
    }

    return {
      openStream: fromFilteredPairs(lastProjectPathsProp, ([currentPaths, newPaths]) =>
        newPaths.filter(path => currentPaths.indexOf(path) < 0)
      ),

      closeStream: fromFilteredPairs(lastProjectPathsProp, ([currentPaths, newPaths]) =>
        currentPaths.filter(path => newPaths.indexOf(path) < 0)
      )
    }
  },

  cancelCommand () {
    let resetVimStream = commandStream('atom-text-editor.vim-mode', 'vim-mode:reset-normal-mode')
    let coreCancelStream = commandStream('atom-text-editor', 'core:cancel')
    return resetVimStream.merge(coreCancelStream)
  }

}
