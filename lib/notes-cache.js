/* @flow */

import R from 'ramda'
import DisposableValues from './disposable-values'

const CACHE_VERSION = 1
const CUSTOM_STATE_KEY = ['textual-velocity']

/**
 * Utilize Atom's existing atom.stateStore object to cache notes globally instead of just for current Atom session
 * https://github.com/atom/atom/blob/ef6b3646050261fd71452b870cc0065befe9cfcb/src/atom-environment.coffee#L141
 */
export default class NotesCache {

  _notes = Object
  _disposableValues: DisposableType

  constructor () {
    this._notes = {}

    this._disposableValues = new DisposableValues(
      atom.config.onDidChange('textual-velocity.path', () => {
        this._notes = {}
      }),
      atom.commands.add('atom-workspace', 'textual-velocity:clear-notes-cache', () => {
        this._notes = {}
        atom.notifications.addSuccess('Notes cache cleared!', {
          description: 'Will take effect when the session is restarted or notes path is changed.'
        })
      })
    )
  }

  dispose () {
    this._disposableValues.dispose()
  }

  load (callback: Function) {
    if (atom.enablePersistence) {
      atom.stateStore
        .load(atom.getStateKey(CUSTOM_STATE_KEY))
        .then(state => {
          this._notes = R.pathOr({}, [CACHE_VERSION, atom.config.get('textual-velocity.path')], state)
          callback(this._notes)
        })
    } else {
      callback(this._notes)
    }
  }

  save (callback: Function) {
    if (atom.enablePersistence) {
      const state = {}
      state[CACHE_VERSION] = {}
      state[CACHE_VERSION][atom.config.get('textual-velocity.path')] = this._notes
      atom.stateStore.save(atom.getStateKey(CUSTOM_STATE_KEY), state).then(callback)
    } else {
      callback()
    }
  }
}
