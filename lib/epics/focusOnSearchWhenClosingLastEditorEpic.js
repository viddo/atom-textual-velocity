/* @flow */

import { debounceTime, filter } from "rxjs/operators";
import observe from "../atom-rxjs/observe";
import takeUntilDispose from "../takeUntilDispose";

import type { Action } from "../actions";

export default function focusOnSearchWhenClosingLastEditorEpic(
  action$: rxjs$Observable<Action>
) {
  return observe(atom.workspace, "onDidDestroyPaneItem").pipe(
    debounceTime(50),
    filter(() => {
      if (atom.workspace.getTextEditors().length === 0) {
        atom.commands.dispatch(
          atom.views.getView(atom.workspace),
          "textual-velocity:focus-on-search"
        );
      }
      return false;
    }),
    takeUntilDispose(action$)
  );
}
