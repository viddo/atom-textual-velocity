/* @flow */

import path from "path";
import { merge } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map
} from "rxjs/operators";
import * as A from "../actions";
import previewEditor from "../previewEditor";
import takeUntilDispose from "../takeUntilDispose";
import { showWarningNotification } from "../showWarningNotification";

import type { Action } from "../actions";
import type { State } from "../../flow-types/State";
import type { PreviewEditor } from "../../flow-types/PreviewEditor";

const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/;

export default function previewNoteEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>
) {
  let preview: PreviewEditor | null = null;
  const destroyPreview = () => {
    if (preview) {
      preview.destroy();
      preview = null;
    }
  };

  return merge(
    // Open/close preview based on selectedNote state
    action$.pipe(
      debounceTime(25),
      map(() => state$.value),
      distinctUntilChanged((a: State, b: State) => {
        return (
          (a.selectedNote && a.selectedNote.filename) ===
          (b.selectedNote && b.selectedNote.filename)
        );
      }),
      filter(() => {
        const state = state$.value;
        if (!state.selectedNote) {
          destroyPreview();
          return false;
        }

        const { filename } = state.selectedNote;
        const notePath = path.join(state.dir, filename);

        // if there already exists a text-editor, use that instead of preview
        if (existsOpenTextEditorForPath(notePath)) {
          destroyPreview();
          atom.workspace.open(notePath, {
            activatePane: false,
            searchAllPanes: true
          });
        } else {
          // no text editor for selected note, show preview
          const note = state.notes[filename];
          if (note) {
            const searchRegexps = state.sifterResult.tokens.map(t => t.regex);
            if (!preview) {
              preview = previewEditor();
            }
            preview
              .openPreview(notePath, note.content, searchRegexps)
              .catch(error => {
                showWarningNotification("Failed to preview note", error);
              });
          }
        }

        return false;
      })
    ),

    // Open on specific open-note action
    action$.pipe(
      filter(action => {
        if (action.type === A.OPEN_NOTE) {
          const state = state$.value;
          let filename;

          if (state.selectedNote) {
            filename = state.selectedNote.filename;
          } else {
            filename = state.queryOriginal.trim() || "untitled";

            if (!HAS_FILE_EXT_REGEX.test(filename)) {
              const ext = atom.config
                .get("textual-velocity.defaultExt")
                .replace(/^\./, ""); // avoid double dots next to extension, i.e. untitled..txt => untitled.txt
              filename = `${filename}.${ext}`;
            }
          }

          atom.workspace
            .open(path.join(state.dir, filename))
            .then(destroyPreview);
        }

        return false;
      })
    )
  ).pipe(takeUntilDispose(action$), finalize(destroyPreview));
}

function existsOpenTextEditorForPath(notePath: string) {
  // until https://github.com/eslint/eslint/issues/12117 is resolved:
  // eslint-disable-next-line no-unused-vars
  for (let textEditor of atom.workspace.getTextEditors()) {
    if (textEditor.getPath() === notePath) {
      return true;
    }
  }

  return false;
}
