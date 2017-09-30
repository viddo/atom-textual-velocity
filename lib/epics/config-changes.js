/* @flow */

import { Observable } from "rxjs";
import { observeConfig } from "../atom-rxjs-observables";
import * as A from "../action-creators";

export default function configChangesEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  return Observable.merge(
    observeConfig("textual-velocity.listHeight")
      .map(A.changeListHeight)
      .distinctUntilChanged(),
    observeConfig("textual-velocity.rowHeight")
      .map(A.changeRowHeight)
      .distinctUntilChanged(),
    observeConfig("textual-velocity.sortDirection")
      .map(A.changeSortDirection)
      .distinctUntilChanged(),
    observeConfig("textual-velocity.sortField")
      .map(A.changeSortField)
      .distinctUntilChanged(),
    observeConfig("textual-velocity.editCellName")
      .skip(1) // i.e. skip any value from previous session
      .filter(editCellName => typeof editCellName === "string")
      .map(A.editCell)
      .do(editCellName => {
        // reset value immediately, will be excluded by filter check above
        atom.config.set("textual-velocity.editCellName", null);
      }),
    action$ // include side-effects stream in merge so it's unsubscribed upon dispose, too
      .debounceTime(200)
      .filter(action => {
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
  ).takeUntil(action$.filter(action => action.type === A.DISPOSE));
}
