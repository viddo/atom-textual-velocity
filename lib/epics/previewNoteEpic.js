/* @flow */

import path from "path";
import { fromEvent, merge } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map
} from "rxjs/operators";
import * as A from "../actions";
import PreviewElement from "../PreviewElement";
import takeUntilDispose from "../takeUntilDispose";

import type { Action } from "../actions";
import type { State } from "../flow-types/State";

const PREVIEW_SCHEMA_PREFIX = "tv://";
const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/;

export default function previewNoteEpic(
  action$: rxjs$Observable<Action>,
  state$: reduxRxjs$StateObservable<State>
) {
  const previewElement = new PreviewElement();

  const openerDisposable = atom.workspace.addOpener(uri => {
    if (uri.startsWith(PREVIEW_SCHEMA_PREFIX)) {
      return previewElement;
    }
  });

  const closePreview = () => {
    const pane = atom.workspace.paneForItem(previewElement);
    if (pane) {
      pane.destroyItem(previewElement);
    }
  };

  return merge(
    // Open/close preview based on selectedNote state
    action$.pipe(
      debounceTime(25),
      map(() => state$.value),
      distinctUntilChanged((a: Store, b: Store) => {
        return (
          (a.selectedNote && a.selectedNote.filename) ===
          (b.selectedNote && b.selectedNote.filename)
        );
      }),
      filter(() => {
        const state = state$.value;
        if (!state.selectedNote) {
          closePreview();
          return false;
        }

        const filename = state.selectedNote.filename;
        const notePath = path.join(state.dir, filename);

        for (let textEditor of atom.workspace.getTextEditors()) {
          if (textEditor.getPath() === notePath) {
            // there is already a text-editor use that as preview instead
            closePreview();
            atom.workspace.open(notePath, {
              activatePane: false,
              searchAllPanes: true
            });
            return false;
          }
        }

        const note = state.notes[filename];
        if (note) {
          const searchRegex =
            state.sifterResult.tokens[0] && state.sifterResult.tokens[0].regex;
          previewElement.updatePreview(
            notePath,
            note.content || "",
            searchRegex
          );

          atom.workspace
            .open(PREVIEW_SCHEMA_PREFIX + notePath, {
              activatePane: false,
              searchAllPanes: true
            })
            .then(() => {
              previewElement.scrollToFirstHighlightedItem();
            });
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
            .then(closePreview);
        }

        return false;
      })
    ),

    // Replace preview with default editor when clicked
    fromEvent(previewElement, "click").pipe(
      filter(() => {
        atom.workspace.open(previewElement.getPath()).then(closePreview);
        return false;
      })
    )
  ).pipe(
    takeUntilDispose(action$),
    finalize(() => {
      closePreview();
      openerDisposable.dispose();
      previewElement.dispose();
    })
  );
}
