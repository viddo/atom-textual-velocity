/* @flow */

import { Observable } from "rxjs";
import Path from "path";
import PreviewElement from "../preview-element";
import * as A from "../action-creators";

const PREVIEW_SCHEMA_PREFIX = "tv://";
const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/;

export default function previewNoteEpic(
  action$: Observable<Action>,
  store: Store<State, Action>
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

  return Observable.merge(
    // Open/close preview based on selectedNote state
    action$
      .debounceTime(25) // ms
      .map(() => store.getState())
      .distinctUntilChanged((a: Store, b: Store) => {
        return (
          (a.selectedNote && a.selectedNote.filename) ===
          (b.selectedNote && b.selectedNote.filename)
        );
      })
      .filter(() => {
        const state: State = store.getState();
        if (!state.selectedNote) {
          closePreview();
          return false;
        }

        const filename = state.selectedNote.filename;
        const path = Path.join(state.dir, filename);

        for (let textEditor of atom.workspace.getTextEditors()) {
          if (textEditor.getPath() === path) {
            // there is already a text-editor use that as preview instead
            closePreview();
            atom.workspace.open(path, {
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
          previewElement.updatePreview(path, note.content || "", searchRegex);

          atom.workspace
            .open(PREVIEW_SCHEMA_PREFIX + path, {
              activatePane: false,
              searchAllPanes: true
            })
            .then(() => {
              previewElement.scrollToFirstHighlightedItem();
            });
        }

        return false;
      }),
    // Open on specific open-note action
    action$.filter(action => {
      if (action.type === A.OPEN_NOTE) {
        const state: State = store.getState();
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

        atom.workspace.open(Path.join(state.dir, filename)).then(closePreview);
      }

      return false;
    }),
    // Replace preview with default editor when clicked
    Observable.fromEvent(previewElement, "click").filter(() => {
      atom.workspace.open(previewElement.getPath()).then(closePreview);
      return false;
    })
  ) // .merge
    .takeUntil(
      action$.filter(action => {
        const isDisposeAction = action.type === A.DISPOSE;
        if (isDisposeAction) {
          closePreview();
          openerDisposable.dispose();
          previewElement.dispose();
        }
        return isDisposeAction;
      })
    );
}
