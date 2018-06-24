/* @flow */

import { merge } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map
} from "rxjs/operators";
import observeConfig from "../atom-rxjs/observeConfig";
import * as A from "../actions";
import takeUntilDispose from "../takeUntilDispose";

import type { Action } from "../actions";

export default function configChangesEpic(action$: rxjs$Observable<Action>) {
  return merge(
    observeConfig("textual-velocity.listHeight").pipe(
      map(A.changeListHeight),
      distinctUntilChanged()
    ),
    observeConfig("textual-velocity.rowHeight").pipe(
      map(A.changeRowHeight),
      distinctUntilChanged()
    ),
    observeConfig("textual-velocity.sortDirection").pipe(
      map(A.changeSortDirection),
      distinctUntilChanged()
    ),
    observeConfig("textual-velocity.sortField").pipe(
      map(A.changeSortField),
      distinctUntilChanged()
    ),

    action$ // include side-effects stream in merge so it's unsubscribed upon dispose, too
      .pipe(
        debounceTime(200),
        filter(action => {
          switch (action.type) {
            case A.RESIZED_LIST:
              atom.config.set("textual-velocity.listHeight", action.listHeight);
              break;

            case A.CHANGED_ROW_HEIGHT:
              atom.config.set("textual-velocity.rowHeight", action.rowHeight);
              break;

            case A.CHANGED_SORT_DIRECTION:
              atom.config.set(
                "textual-velocity.sortDirection",
                action.sortDirection
              );
              break;

            case A.CHANGED_SORT_FIELD:
              atom.config.set("textual-velocity.sortField", action.sortField);
          }

          return false; // to avoid creating an infinite loop (see https://redux-observable.js.org/docs/basics/Epics.html)
        })
      )
  ).pipe(takeUntilDispose(action$));
}
