/* @flow */

import Path from 'path'
import {Observable} from 'rxjs'
import {observe} from '../atom-rxjs-observables'

import {
  CHANGED_SORT_DIRECTION,
  CHANGED_SORT_FIELD,
  CLICK_ROW,
  DISPOSE,
  KEY_PRESS,
  RESET_SEARCH,
  SEARCH,
  selectNote,
  deselectNote
} from '../action-creators'

export const UP = 38
export const DOWN = 40

const EXPECTED_KEY_CODES = [DOWN, UP]

export default function selectNoteEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  const activeEditorPath$ = observe(atom.workspace, 'onDidStopChangingActivePaneItem')
    .map(paneItem => {
      if (paneItem && paneItem.getPath) {
        const path = paneItem.getPath()
        const state: State = store.getState()
        const filename = path.replace(state.config.dir + Path.sep, '')
        if (state.notes[filename]) {
          const index = state.sifterResult.items.findIndex(item => item.id === filename)
          if (index !== -1) {
            return selectNote({index, filename})
          }
        } else {
          return deselectNote()
        }
      }
    })

  const clickRow$ = action$
    .filter(action => action.type === CLICK_ROW)
    .map((action_: any) => {
      const action: ClickRow = action_
      const {filename} = action
      const state: State = store.getState()
      const index = state.sifterResult.items.findIndex(item => item.id === filename)
      if (index !== -1) {
        return selectNote({index, filename})
      }
    })

  const selection$ = action$
    .map(action => {
      let filename: string
      let index = -1
      let state: State
      let keyCode

      switch (action.type) {
        case SEARCH:
        case RESET_SEARCH:
          return deselectNote()

        case KEY_PRESS:
          keyCode = action.event.keyCode
          if (!EXPECTED_KEY_CODES.some(x => x === keyCode)) {
            break
          }
        case CHANGED_SORT_FIELD: // eslint-disable-line no-fallthrough
        case CHANGED_SORT_DIRECTION:
          state = store.getState()
          const items = state.sifterResult.items

          if (items.length > 0) {
            filename = state.selectedNote && state.selectedNote.filename
            if (filename) {
              index = items.findIndex(item => item.id === filename)
            }

            switch (action.type) {
              case CHANGED_SORT_FIELD:
              case CHANGED_SORT_DIRECTION:
                if (index !== -1) {
                  return selectNote({
                    index,
                    filename
                  })
                }
                break

              case KEY_PRESS:
                switch (action.event.keyCode) {
                  case DOWN:
                    action.event.preventDefault()
                    index = Math.min(index + 1, items.length - 1) // stop at end of list
                    break
                  case UP:
                    action.event.preventDefault()
                    if (index === -1) {
                      index = items.length // start from end of list
                    }
                    index = Math.max(index - 1, 0) // stop at beginning of list
                    break
                }

                return selectNote({
                  index,
                  filename: items[index].id
                })
            }
          }
      }

      return null
    })

  return Observable
    .merge(
      activeEditorPath$,
      clickRow$,
      selection$
    )
    .filter(selection => !!selection)
    .takeUntil(
      action$.filter(action => action.type === DISPOSE)
    )
}
