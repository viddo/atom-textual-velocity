/* @flow */

import Path from 'path'
import * as A from '../action-creators'

const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default function openNoteEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  return action$
    .filter(action => {
      if (action.type === A.OPEN_NOTE) {
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
      }

      return false
    })
    .takeUntil(
      action$.filter(action => action.type === A.DISPOSE)
    )
}
