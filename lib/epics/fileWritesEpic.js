/* @flow */

import Path from "path";
import { Observable } from "rxjs";
import * as A from "../actions";
import type { Action } from "../actions";
import type { IFileWriters } from "../flow-types/IFileWriters";
import type { State } from "../flow-types/State";
import { showWarningNotification } from "../showWarningNotification";

export default function fileWritesEpic(
  action$: Observable<Action>,
  store: Store<State, Action>,
  { fileWriters }: { fileWriters: IFileWriters }
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
          // write result is handled implicitly, through the path watcher change event, instead of creating an action here
          fileWriter.write(path, action.value, error => {
            if (error) {
              showWarningNotification(`Failed to save file ${path}`, error);
            }
          });
        }
      }

      return false;
    })
    .takeUntil(action$.filter(({ type }) => type === A.DISPOSE).take(1));
}
