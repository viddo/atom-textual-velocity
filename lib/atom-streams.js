'use babel'

import Bacon from 'baconjs'

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
