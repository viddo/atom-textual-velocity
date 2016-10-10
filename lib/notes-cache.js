/* @flow */

import R from 'ramda'
import Disposables from './disposables'

const CACHE_VERSION = 1
const CUSTOM_STATE_KEY = ['textual-velocity']

/**
 * Utilize Atom's existing atom.stateStore object to cache notes globally instead of just for current Atom session
 * https://github.com/atom/atom/blob/ef6b3646050261fd71452b870cc0065befe9cfcb/src/atom-environment.coffee#L141
 */
export default class NotesCache {

  _notes = Object
  _disposables: Disposables

  constructor () {
    this._notes = {}

    this._disposables = new Disposables(
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
    this._disposables.dispose()
  }

  load () {
    return new Promise((resolve, reject) => {
      if (!atom.enablePersistence) resolve(this._notes)

      return atom.stateStore
        .load(atom.getStateKey(CUSTOM_STATE_KEY))
        .then(state => {
          this._notes = R.pathOr({}, [CACHE_VERSION, atom.config.get('textual-velocity.path')], state)
          resolve(this._notes)
        })
        .catch(err => {
          console.warn('textual-velocity: could not load cached notes:', err)
          resolve(this._notes)
        })
    })
  }

  save () {
    if (!atom.enablePersistence) return new Promise((resolve, reject) => { reject('atom.enablePersistence is set to false') })

    const state = {}
    state[CACHE_VERSION] = {}
    state[CACHE_VERSION][atom.config.get('textual-velocity.path')] = this._notes
    return atom.stateStore
      .save(atom.getStateKey(CUSTOM_STATE_KEY), state)
      .catch(err => {
        console.warn('textual-velocity: could not save notes cache:', err)
      })
  }
}
