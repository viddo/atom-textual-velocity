/* @flow */

import Path from 'path'

import {DISPOSE, KEY_PRESS, resetSearch} from '../action-creators'

export const ESC = 27
export const ENTER = 13
const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default function keyPressEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  return action$
    .map(action => {
      if (action.type !== KEY_PRESS) return false

      switch (action.event.keyCode) {
        case ENTER:
          const state: State = store.getState()
          let filename

          if (state.selectedNote) {
            ({filename} = state.selectedNote)
          } else {
            const query = state.sifterResult.query.trim() || 'untitled'
            filename = HAS_FILE_EXT_REGEX.test(query)
              ? query
              : `${query}.${atom.config.get('textual-velocity.defaultExt').replace(/^\./, '')}`
          }

          atom.workspace.open(Path.join(state.config.dir, filename))
          return false

        case ESC:
          return resetSearch()

        default:
          return false
      }
    })
    .filter(action => !!action)
    .takeUntil(
      action$.filter(action => action.type === DISPOSE)
    )
}
