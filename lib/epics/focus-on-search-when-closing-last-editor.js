/* @flow */

import { Observable } from "rxjs";
import { observe } from "../atom-rxjs-observables";
import * as A from "../action-creators";

export default function focusOnSearchWhenClosingLastEditorEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  return observe(atom.workspace, "onDidDestroyPaneItem")
    .debounceTime(50)
    .map(() => {
      if (atom.workspace.getTextEditors().length === 0) {
        atom.commands.dispatch(
          atom.views.getView(atom.workspace),
          "textual-velocity:focus-on-search"
        );
      }
    })
    .filter(action => !!action)
    .takeUntil(action$.filter(({ type }) => type === A.DISPOSE).take(1));
}
