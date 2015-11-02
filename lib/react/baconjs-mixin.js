'use babel'

import Bacon from 'baconjs'

export default {
  onStreamsValues () {
    if (!this._unsubscribeFns) this._unsubscribeFns = []
    this._unsubscribeFns.push(Bacon.onValues.apply(Bacon, arguments))
  },

  componentWillUnmount () {
    this._unsubscribeFns.forEach(fn => fn())
  }
}
