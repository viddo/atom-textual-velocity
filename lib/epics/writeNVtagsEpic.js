/* @flow */
import Path from "path";
import { merge, never } from "rxjs";
import { filter, map } from "rxjs/operators";
import * as A from "../actions";
import NVtags from "../NVtags";
import observeAtomObj from "../observeAtomObj";
import { showWarningNotification } from "../showWarningNotification";
import takeUntilDispose from "../takeUntilDispose";

import type { Action } from "../actions";
import type { State } from "../flow-types/State";

export default function writeNVtagsEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>
) {
  if (NVtags.unsupportedError) {
    return never();
  }

  return merge(
    observeAtomObj(atom.commands, "add", [
      ".platform-darwin .textual-velocity",
      "textual-velocity:edit-nv-tags"
    ]).pipe(map(() => A.editCell("nvtags"))),

    observeAtomObj(atom.commands, "add", [
      ".platform-linux .textual-velocity",
      "textual-velocity:edit-nv-tags"
    ]).pipe(map(() => A.editCell("nvtags"))),

    action$.pipe(
      map(action => {
        if (action.type !== A.EDIT_CELL_SAVE) {
          return;
        }

        const state = state$.value;
        if (state.editCellName !== "nvtags" || !state.selectedNote) {
          return;
        }

        const path = Path.join(state.dir, state.selectedNote.filename);

        // Note gets updated through file watcher
        NVtags.write(path, action.value, (error: ?Error) => {
          if (error) {
            showWarningNotification(
              `Failed to save tags ${action.value}`,
              error
            );
          }
        });

        return A.editCellDone();
      }),
      filter(Boolean)
    )
  ).pipe(takeUntilDispose(action$));
}
