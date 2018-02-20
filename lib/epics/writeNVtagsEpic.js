/* @flow */
import Path from "path";
import { Observable } from "rxjs";
import * as A from "../actions";
import NVtags from "../NVtags";
import observeAtomObj from "../observeAtomObj";
import * as C from "../constants";
import { showWarningNotification } from "../showWarningNotification";
import type { Action } from "../actions";
import type { State } from "../flow-types/State";

const ALWAYS_FALSE = () => false;

export default function writeNVtagsEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  if (NVtags.unsupportedError) {
    return Observable.never();
  }

  return Observable.merge(
    observeAtomObj(atom.commands, "add", [
      ".platform-darwin .textual-velocity",
      "textual-velocity:edit-nv-tags"
    ]).map(() => A.editCell(C.NV_TAGS_FILE_PROP_NAME)),

    observeAtomObj(atom.commands, "add", [
      ".platform-linux .textual-velocity",
      "textual-velocity:edit-nv-tags"
    ]).map(() => A.editCell(C.NV_TAGS_FILE_PROP_NAME)),

    action$
      .do(action => {
        if (action.type !== A.EDIT_CELL_SAVE) {
          return;
        }

        const state: State = store.getState();
        if (
          state.editCellName !== C.NV_TAGS_FILE_PROP_NAME ||
          !state.selectedNote
        ) {
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
      })
      .filter(ALWAYS_FALSE)
  ).takeUntil(action$.filter(({ type }) => type === A.DISPOSE).take(1));
}
