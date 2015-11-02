'use babel'

import Bacon from 'baconjs'

const createStream = (obj, funcName, ...args) => {
  return Bacon.fromBinder(sink => {
    args.push(sink)
    const disposable = obj[funcName].apply(obj, args)
    return () => disposable.dispose()
  })
}

const createCommandStream = (context, command) => {
  return createStream(atom.commands, 'add', context, command)
}

export default {
  createStream: createStream,
  createCommandStream: createCommandStream,

  createConfigStream (key) {
    return createStream(atom.config, 'observe', key)
  },

  createProjectsPathsStreams () {
    const lastProjectPathsProp = Bacon.sequentially(0, [[], atom.project.getPaths()])
      .merge(createStream(atom.project, 'onDidChangePaths'))
      .slidingWindow(2, 2)

    const fromFilteredPairs = (pairwiseStream, predicate) => {
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

  createCancelCommandStream () {
    const resetVimStream = createCommandStream('atom-text-editor.vim-mode', 'vim-mode:reset-normal-mode')
    const coreCancelStream = createCommandStream('atom-text-editor', 'core:cancel')
    return resetVimStream.merge(coreCancelStream)
  }

}
