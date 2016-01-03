'use babel'

import Bacon from 'baconjs'
import R from 'ramda'

export default function (process) {
  const rawStream = Bacon.fromEvent(process, 'message')
  return {
    createStream: (name) =>
      rawStream
        .filter(R.propEq('name', name))
        .map(R.prop('payload'))
  }
}
