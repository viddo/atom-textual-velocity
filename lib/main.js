/* @flow */

import Session from './session'

export default {

  activate (state?: Object) {
    this._startSession()
  },

  deactivate () {
    this._stopSession()
    this._disposeStartSessionCmd()
  },

  _startSession () {
    this._disposeStartSessionCmd()
    this._session = new Session()

    this._stopSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:stop-session', () => {
      this._stopSession()
      this._startSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:start-session', () => {
        this._startSession()
      })
    })
  },

  _stopSession () {
    if (this._stopSessionCmd) {
      this._session.dispose()
      this._session = null
      this._stopSessionCmd.dispose()
      this._stopSessionCmd = null
    }
  },

  _disposeStartSessionCmd () {
    if (this._startSessionCmd) {
      this._startSessionCmd.dispose()
      this._startSessionCmd = null
    }
  }

}
