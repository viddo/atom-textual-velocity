/* @flow */

import { filter, map, withLatestFrom } from "rxjs/operators";
import observe from "../atom-rxjs/observe";
import * as A from "../actions";
import takeUntilDispose from "../takeUntilDispose";

import type { Action } from "../actions";

export default function activePaneItemEpic(action$: rxjs$Observable<Action>) {
  return observe(atom.workspace, "onDidStopChangingActivePaneItem").pipe(
    withLatestFrom(action$.pipe(map(() => Date.now()))),
    map(([paneItem, lastActionTimestamp]) => {
      if (Date.now() - lastActionTimestamp > 100) {
        let path = null;
        if (paneItem && typeof paneItem.getPath === "function") {
          path = paneItem.getPath();
        }

        return A.changedActivePaneItem(path);
      }
    }),
    filter(Boolean),
    takeUntilDispose(action$)
  );
}
