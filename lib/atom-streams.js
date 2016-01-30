'use babel'

import Bacon from 'baconjs'
import R from 'ramda'

export const createStream = (obj, funcName, ...args) => {
  return Bacon.fromBinder(sink => {
    args.push(sink)
    const disposable = obj[funcName].apply(obj, args)
    return () => disposable.dispose()
  })
}

export function createCommandStream (context, command) {
  return createStream(atom.commands, 'add', context, command)
}

export function createConfigStream (key) {
  return createStream(atom.config, 'observe', key)
}

export function createCloseProjectPathStream () {
  return createStream(atom.project, 'onDidChangePaths')
    .diff(atom.project.getPaths(), R.difference)
    .flatMap(paths => Bacon.sequentially(0, paths))
}

export function createOpenProjectPathStream () {
  return createStream(atom.project, 'onDidChangePaths')
    .startWith(atom.project.getPaths())
    .diff([], R.flip(R.difference))
    .flatMap(paths => Bacon.sequentially(0, paths))
}
