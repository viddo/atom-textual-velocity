/* @flow */

import Rx from 'rxjs'
import {changeListHeight, changeRowHeight, changeSortDirection, changeSortField} from '../action-creators'
import {observeConfig} from '../atom-rxjs-observables'

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
          case 'RESIZED_LIST':
            atom.config.set('textual-velocity.listHeight', action.listHeight)
            return false
          case 'CHANGED_ROW_HEIGHT':
            atom.config.set('textual-velocity.rowHeight', action.rowHeight)
            return false
          case 'CHANGED_SORT_DIRECTION':
            atom.config.set('textual-velocity.sortDirection', action.sortDirection)
            return false
          case 'CHANGED_SORT_FIELD':
            atom.config.set('textual-velocity.sortField', action.sortField)
            return false
          default:
            return false
        }
      }))

  return allObservable$
    .takeUntil(
      action$.filter(action => action.type === 'DISPOSE')
    )
}
