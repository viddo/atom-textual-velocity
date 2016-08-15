/* @flow */

import Bacon from 'baconjs'

export function createStream (obj: Object, funcName: string, ...args: Array<any>): Bacon.Stream {
  return Bacon.fromBinder(sink => {
    args.push(sink)
    const disposable = obj[funcName].apply(obj, args)
    return () => disposable.dispose()
  })
}

export function createCommandStream (context: string, command: string): Bacon.Stream {
  return createStream(atom.commands, 'add', context, command)
}

export function createConfigStream (key: string): Bacon.Stream {
  return createStream(atom.config, 'observe', key)
}
