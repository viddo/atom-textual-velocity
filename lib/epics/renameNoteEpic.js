/* @flow */
import fs from "fs";
import Path from "path";
import { Observable } from "rxjs";
import * as A from "../actions";
import observeAtomObj from "../observeAtomObj";
import { showWarningNotification } from "../showWarningNotification";
import type { Action } from "../actions";
import type { State } from "../flow-types/State";

export const RENAME_CELL_NAME = "rename";
const ALWAYS_FALSE = () => false;

export default function renameNoteEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  return Observable.merge(
    observeAtomObj(atom.commands, "add", [
      "atom-workspace",
      "textual-velocity:rename-note"
    ]).map(() => A.editCell(RENAME_CELL_NAME)),

    action$
      .do(action => {
        if (action.type !== A.EDIT_CELL_SAVE) {
          return;
        }

        const state: State = store.getState();
        if (state.editCellName !== RENAME_CELL_NAME || !state.selectedNote) {
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
          fs.rename(oldPath, newPath, (error: ?Error) => {
            if (error) {
              showWarningNotification(
                `Failed to rename ${oldFilename} to ${newFilename}`,
                error
              );
            }
          });
        }
      })
      .filter(ALWAYS_FALSE)
  ).takeUntil(action$.filter(({ type }) => type === A.DISPOSE).take(1));
}
