/* @flow */

import Rx from 'rxjs'
import {changeListHeight} from '../action-creators'
import {observeConfig} from '../atom-rxjs-observables'

export default function configEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  const allObservable$ = Rx.Observable.merge(
    observeConfig('textual-velocity.listHeight').map(changeListHeight),

    action$ // merge to also unsubscribe this on dispose action
      .debounceTime(200)
      .filter(action => {
        switch (action.type) {
          case 'RESIZED_LIST':
            atom.config.set('textual-velocity.listHeight', action.listHeight)
            break
          default:
        }

        return false // to avoid creating an infinite loop (see https://redux-observable.js.org/docs/basics/Epics.html)
      }))

  return allObservable$
    .takeUntil(
      action$.filter(action => action.type === 'DISPOSE')
    )
}
