/* @flow */

import { Observable } from "rxjs";
import { observe } from "../atom-rxjs-observables";
import * as A from "../action-creators";

export default function activePaneItemEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  return observe(atom.workspace, "onDidStopChangingActivePaneItem")
    .withLatestFrom(action$.map(() => Date.now()))
    .map(([paneItem, lastActionTimestamp]) => {
      if (Date.now() - lastActionTimestamp > 100) {
        let path = null;
        if (paneItem && typeof paneItem.getPath === "function") {
          path = paneItem.getPath();
        }

        return A.changedActivePaneItem(path);
      }
    })
    .filter(action => !!action)
    .takeUntil(action$.filter(action => action.type === A.DISPOSE));
}
