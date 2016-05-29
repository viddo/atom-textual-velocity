'use babel'

import Bacon from 'baconjs'
import R from 'ramda'

const PREFIX = 'textual-velocity:'

export default class Logger {

  constructor ({env, console = global.console}) {
    this._env = env
    this._enabled = false
    this._console = console
  }

  toggle (enabled = !this._enabled) {
    this._enabled = enabled
  }

  logSessionStart (request) {
    if (!this._enabled) return

    this._console.log(`${PREFIX} session started (${this._env})`)
    this._console.log(request)
  }

  logPathScan ({filesProp, initialPathScanDoneProp}) {
    if (!this._enabled) return

    this._console.groupCollapsed(`${PREFIX} scanning path for files`)

    filesProp
      .takeWhile(initialPathScanDoneProp.not()) // "takes values while the value of a property holds true, and then ends."
      .onValue(files => {
        this._console.log(R.last(files))
      })

    // End console group and log grand total of files that were added
    filesProp
      .sampledBy(initialPathScanDoneProp.filter(R.identity))
      .subscribe(next => {
        this._console.groupEnd(`${PREFIX} scanning path for files`)
        this._console.log(`${PREFIX} ${next.value().length} files found`)
        return Bacon.noMore // to only call this side-effect once
      })
  }

  logSessionEnd () {
    if (!this._enabled) return

    this._console.log(`${PREFIX} session stopped`)
  }

}
