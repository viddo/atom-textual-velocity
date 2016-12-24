/* @flow */

import {resetSearch, selectNextNote, selectPrevNote} from '../action-creators'

export const ESC = 27
export const UP = 38
export const DOWN = 40

export default function keyDownEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  return action$
    .map(action => {
      if (action.type !== 'KEY_DOWN') return false

      switch (action.event.keyCode) {
        case ESC:
          return resetSearch()
        case DOWN:
          action.event.preventDefault()
          return selectNextNote()
        case UP:
          action.event.preventDefault()
          return selectPrevNote()
        default:
          return false
      }
    })
    .filter(action => !!action)
    .takeUntil(
      action$.filter(action => action.type === 'DISPOSE')
    )
}
