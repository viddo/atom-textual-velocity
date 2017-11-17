/* @flow */

import Path from "path";
import { Observable } from "rxjs";
import * as A from "../action-creators";

export default function makeFileWritesEpic(fileWriters: FileWriters) {
  return function fileWritesEpic(
    action$: Observable<Action>,
    store: Store<State, Action>
  ) {
    return action$
      .filter(action => {
        if (action.type === A.EDIT_CELL_SAVE) {
          const state: State = store.getState();
          const editCellName = action.editCellName;

          const fileWriter = fileWriters.find(
            fileWriter => fileWriter.editCellName === editCellName
          );

          if (fileWriter && state.selectedNote) {
            const path = Path.join(state.dir, state.selectedNote.filename);
            fileWriter.write(path, action.value, (error, result) => {
              if (error) {
                const message = `Textual-Velocity: Failed to save file ${
                  path
                }:'`;
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
      .takeUntil(action$.filter(action => action.type === A.DISPOSE));
  };
}
