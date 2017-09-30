/* @flow */

import { Observable } from "rxjs";

export default function atCopyMatchToClipboardEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
) {
  return action$
    .debounceTime(25) // ms
    .filter(() => {
      const state: State = store.getState();

      if (state.selectedNote) {
        const filename = state.selectedNote.filename;
        const note = state.notes[filename];

        if (note && typeof note.content === "string") {
          const match = note.content.match(/@copy\(([\S\s]*)\)/);

          if (match && match[1]) {
            atom.clipboard.write(match[1]);
          }
        }
      }
      return false;
    });
}
