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
          filename = state.selectedNote.filename
        } else {
          filename = state.queryOriginal.trim() || 'untitled'

          if (!HAS_FILE_EXT_REGEX.test(filename)) {
            const ext = atom.config.get('textual-velocity.defaultExt')
              .replace(/^\./, '') // avoid double dots next to extensio, i.e. untitled..txt => untitled.txt
            filename = `${filename}.${ext}`
          }
        }

        atom.workspace.open(Path.join(state.dir, filename))
      }

      return false
    })
    .takeUntil(
      action$.filter(action => action.type === A.DISPOSE)
    )
}
