/* @flow */

import { Observable } from "rxjs";
import { observe } from "../atom-rxjs-observables";
import * as A from "../action-creators";
import * as C from "../action-constants";

export default function activePaneItemEpic(action$: Observable<Action>) {
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
    .takeUntil(action$.filter(({ type }) => type === C.DISPOSE).take(1));
}
