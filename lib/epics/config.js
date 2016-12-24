/* @flow */

import Rx from 'rxjs'
import {observeConfig} from '../atom-rxjs-observables'
import {
  CHANGED_ROW_HEIGHT,
  CHANGED_SORT_DIRECTION,
  CHANGED_SORT_FIELD,
  changeListHeight,
  changeRowHeight,
  changeSortDirection,
  changeSortField,
  DISPOSE,
  RESIZED_LIST
} from '../action-creators'

export default function configEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  const allObservable$ = Rx.Observable.merge(
    observeConfig('textual-velocity.listHeight').map(changeListHeight).distinctUntilChanged(),
    observeConfig('textual-velocity.rowHeight').map(changeRowHeight).distinctUntilChanged(),
    observeConfig('textual-velocity.sortDirection').map(changeSortDirection).distinctUntilChanged(),
    observeConfig('textual-velocity.sortField').map(changeSortField).distinctUntilChanged(),

    action$ // merge to also unsubscribe this on dispose action
      .debounceTime(200)
      .filter(action => {
        // return false to avoid creating an infinite loop (see https://redux-observable.js.org/docs/basics/Epics.html)
        switch (action.type) {
          case RESIZED_LIST:
            atom.config.set('textual-velocity.listHeight', action.listHeight)
            return false
          case CHANGED_ROW_HEIGHT:
            atom.config.set('textual-velocity.rowHeight', action.rowHeight)
            return false
          case CHANGED_SORT_DIRECTION:
            atom.config.set('textual-velocity.sortDirection', action.sortDirection)
            return false
          case CHANGED_SORT_FIELD:
            atom.config.set('textual-velocity.sortField', action.sortField)
            return false
          default:
            return false
        }
      }))

  return allObservable$
    .takeUntil(
      action$.filter(action => action.type === DISPOSE)
    )
}
