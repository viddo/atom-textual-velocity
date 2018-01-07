/* @flow */

import Path from "path";
import { Observable } from "rxjs";
import * as A from "../actions";
import type { Action } from "../actions";
import type { FileWriters } from "../flow-types/File";
import type { State } from "../flow-types/State";

export default function fileWritesEpic(
  action$: Observable<Action>,
  store: Store<State, Action>,
  { fileWriters }: { fileWriters: FileWriters }
) {
  return action$
    .filter(action => {
      if (action.type === A.EDIT_CELL_SAVE) {
        const state: State = store.getState();
        const editCellName = state.editCellName;

        const fileWriter = fileWriters.find(
          fileWriter => fileWriter.editCellName === editCellName
        );

        if (fileWriter && state.selectedNote) {
          const path = Path.join(state.dir, state.selectedNote.filename);
          fileWriter.write(path, action.value, error => {
            if (error) {
              const message = `Textual-Velocity: Failed to save file ${path}:'`;
              atom.notifications.addWarning(message, {
                detail: error.message,
                dismissable: true
              });
            }
            // write result is handled implicitly, through the path watcher change event, instead of creating an action here
          });
        }
      }

      return false;
    })
    .takeUntil(action$.filter(({ type }) => type === A.DISPOSE).take(1));
}
