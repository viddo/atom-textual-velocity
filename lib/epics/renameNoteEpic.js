/* @flow */
import fs from "fs";
import Path from "path";
import { merge } from "rxjs";
import { filter, map } from "rxjs/operators";
import * as A from "../actions";
import observeAtomObj from "../observeAtomObj";
import { showWarningNotification } from "../showWarningNotification";
import takeUntilDispose from "../takeUntilDispose";

import type { Action } from "../actions";
import type { State } from "../../flow-types/State";

export default function renameNoteEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>
) {
  return merge(
    observeAtomObj(atom.commands, "add", [
      "atom-workspace",
      "textual-velocity:rename-note"
    ]).pipe(map(() => A.editCell("name"))),

    action$.pipe(
      map(action => {
        if (action.type !== A.EDIT_CELL_SAVE) {
          return;
        }

        const state = state$.value;
        if (state.editCellName !== "name" || !state.selectedNote) {
          return;
        }

        const oldFilename = state.selectedNote.filename;
        const oldPath = Path.join(state.dir, oldFilename);
        const newFilename = action.value
          .split(Path.sep)
          .slice(-1)[0]
          .trim();
        const newPath = Path.normalize(Path.join(state.dir, newFilename));

        if (newFilename && newFilename[0] !== ".") {
          // Note gets updated through file watcher
          fs.rename(oldPath, newPath, (error: ?Error) => {
            if (error) {
              showWarningNotification(
                `Failed to rename ${oldFilename} to ${newFilename}`,
                error
              );
            }
          });
        }

        return A.editCellDone();
      }),
      filter(Boolean)
    )
  ).pipe(takeUntilDispose(action$));
}
