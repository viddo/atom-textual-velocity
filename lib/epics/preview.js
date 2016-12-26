/* @flow */

import {Observable} from 'rxjs'
import Path from 'path'
import PreviewElement from '../preview-element'
import {
  DESELECT_NOTE,
  DISPOSE,
  SELECT_NOTE
} from '../action-creators'

const PREVIEW_SCHEMA_PREFIX = 'tv://'

export default function previewEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  const previewElement = new PreviewElement()

  const openerDisposable = atom.workspace.addOpener((uri) => {
    if (uri.startsWith(PREVIEW_SCHEMA_PREFIX)) {
      return previewElement
    }
  })

  const closePreview = () => {
    const pane = atom.workspace.paneForItem(previewElement)
    if (pane) {
      pane.destroyItem(previewElement)
    }
  }

  const openPreview$ = action$
    .filter(action => action.type === SELECT_NOTE)
    .debounceTime(25)
    .filter((action_: any) => {
      const action: SelectNote = action_
      const state: State = store.getState()
      const filename = action.selectedNote.filename
      const path = Path.join(state.config.dir, filename)

      for (let textEditor of atom.workspace.getTextEditors()) {
        if (textEditor.getPath() === path) {
          // there is already a text-editor use that as preview instead
          closePreview()
          atom.workspace.open(path, {
            activatePane: false,
            searchAllPanes: true
          })
          return false
        }
      }

      const note = state.notes[filename]
      const searchRegex = state.sifterResult.tokens[0] && state.sifterResult.tokens[0].regex

      previewElement.updatePreview(path, note.content || '', searchRegex)
      atom.workspace
        .open(PREVIEW_SCHEMA_PREFIX + path, {
          activatePane: false,
          searchAllPanes: true
        })
        .then(() => {
          previewElement.scrollToFirstHighlightedItem()
        })

      return false
    })

  const closePreview$ = action$
    .filter(action => {
      if (action.type === DESELECT_NOTE) {
        closePreview()
      }
      return false
    })

  const replacePreviewWithEditor$ = Observable
    .fromEvent(previewElement, 'click')
    .filter(() => {
      atom.workspace
        .open(previewElement.getPath())
        .then(closePreview)
      return false
    })

  return Observable
    .merge(
      openPreview$,
      closePreview$,
      replacePreviewWithEditor$
    )
    .takeUntil(
      action$
        .filter(action => {
          if (action.type === DISPOSE) {
            closePreview()
            openerDisposable.dispose()
            previewElement.dispose()
            return true
          }
          return false
        }))
}
