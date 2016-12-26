/* @flow */

import {DISPOSE, KEY_PRESS, resetSearch} from '../action-creators'

export const ESC = 27

export default function keyPressEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  return action$
    .map(action => {
      if (action.type !== KEY_PRESS) return false

      switch (action.event.keyCode) {
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
