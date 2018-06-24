/* @flow */

import { debounceTime, filter } from "rxjs/operators";
import takeUntilDispose from "../takeUntilDispose";

import type { Action } from "../actions";
import type { State } from "../flow-types/State";

export default function atCopyMatchToClipboardEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>
) {
  return action$.pipe(
    // since regexp match on every note selection is quite costly and unnecessary for most cases,
    // let's debounce the call to only call it if staying on the note.
    // time should be fast enough to copy before it's actually pasted somewhere else
    debounceTime(400),
    filter(() => {
      const state = state$.value;

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
    }),
    takeUntilDispose(action$)
  );
}
