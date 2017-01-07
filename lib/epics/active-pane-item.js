/* @flow */

import {observe} from '../atom-rxjs-observables'
import * as A from '../action-creators'

export default function selectPrevEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  return observe(atom.workspace, 'onDidStopChangingActivePaneItem')
    .map(paneItem => {
      let path = null
      if (paneItem && typeof paneItem.getPath === 'function') {
        path = paneItem.getPath()
      }
      return A.changedActivePaneItem(path)
    })
    .takeUntil(
      action$.filter(action => action.type === A.DISPOSE)
    )
}
