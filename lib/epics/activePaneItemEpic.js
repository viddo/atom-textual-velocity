/* @flow */

import { filter, map, withLatestFrom } from "rxjs/operators";
import observe from "../atom-rxjs/observe";
import * as A from "../actions";
import takeUntilDispose from "../takeUntilDispose";
import { PREVIEW_EDITOR_TITLE } from "../previewEditor";

import type { Action } from "../actions";

export default function activePaneItemEpic(action$: rxjs$Observable<Action>) {
  return observe(atom.workspace, "onDidStopChangingActivePaneItem").pipe(
    withLatestFrom(action$.pipe(map(() => Date.now()))),
    map(([paneItem, lastActionTimestamp]) => {
      if (!paneItem) return;
      if (Date.now() - lastActionTimestamp < 100) return;

      if (typeof paneItem.getTitle === "function") {
        if (paneItem.getTitle().includes(PREVIEW_EDITOR_TITLE)) {
          return;
        }
      }

      if (typeof paneItem.getPath === "function") {
        return A.changedActivePaneItem(paneItem.getPath());
      }
    }),
    filter(Boolean),
    takeUntilDispose(action$)
  );
}
