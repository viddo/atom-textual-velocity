/* @flow */

import {observe} from '../atom-rxjs-observables'

import {changedActivePaneItem, DISPOSE} from '../action-creators'

export default function selectPrevEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  return observe(atom.workspace, 'onDidStopChangingActivePaneItem')
    .map(paneItem => {
      let path = null
      if (paneItem && typeof paneItem.getPath === 'function') {
        path = paneItem.getPath()
      }
      return changedActivePaneItem(path)
    })
    .takeUntil(
      action$.filter(action => action.type === DISPOSE)
    )
}
