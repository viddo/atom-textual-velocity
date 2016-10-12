/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import * as atoms from './atom-streams'
import Disposables from './disposables'
import PreviewElement from './preview-element'

export default class SideEffects {

  _disposables: Disposables
  _panel: Atom$Panel

  constructor (panel: Atom$Panel, view: ViewType, presenter: PresenterType, service: ServiceType) {
    this._panel = panel
    const togglePanelCmdS = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-panel')
    const toggleAtomWinCmdS = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-atom-window')
    const sortS = presenter.sortP.changes()

    this._disposables = new Disposables(
      this._saveListHeightOnPanelResize(presenter.listHeightP.changes()),
      this._saveSortDirectionOnChange(sortS.map('.direction')),
      this._saveSortFieldOnChange(sortS.map('.field')),
      this._saveRowHeightOnWinResize(presenter.rowsS),
      this._focusTextInputOnChanges(toggleAtomWinCmdS, togglePanelCmdS),
      this._toggleAtomWinOnCmd(toggleAtomWinCmdS, panel),
      this._togglePanelOnCmd(togglePanelCmdS, panel),
      this._renderLoadingOnLoadingEvent(presenter, view),
      this._renderResultsOnDataChanges(presenter, view),
      this._previewSelectedPath(presenter.selectedPathP, presenter.selectedContentP),
      this._openTextEditorOnOpenEvent(presenter.openPathS),
      this._saveEditedCellOnSave(presenter.saveEditedCellContentS, service.fileWritersP),
      this._updateConfigSchemaOnColumnsChange(service.columnsP),
      this._informAboutRestartingSessionForChangesToTakeEffect()
    )
  }

  dispose () {
    this._disposables.dispose()
  }

  _queryDOM (selector: string): DOMNodeType | void {
    return this._panel.getItem().querySelector(selector)
  }

  _saveListHeightOnPanelResize (listHeightS: Bacon.Stream) {
    return listHeightS
      .debounce(500) // ms
      .onValue(listHeight => {
        atom.config.set('textual-velocity.listHeight', listHeight)
      })
  }

  _saveSortDirectionOnChange (sortDirectionS: Bacon.Stream) {
    return sortDirectionS
      .onValue((direction: string) => {
        atom.config.set('textual-velocity.sortDirection', direction)
      })
  }

  _saveSortFieldOnChange (sortFieldS: Bacon.Stream) {
    return sortFieldS
      .onValue((field: string) => {
        atom.config.set('textual-velocity.sortField', field)
      })
  }

  _saveRowHeightOnWinResize (rowsS: Bacon.Stream) {
    return Bacon
      .mergeAll(
        rowsS.take(1),
        Bacon.fromEvent(window, 'resize'))
      .debounceImmediate(50) // ms
      .onValue(() => {
        const td = this._queryDOM('td')
        if (td && td.clientHeight > 0) {
          atom.config.set('textual-velocity.rowHeight', td.clientHeight)
        }
      })
  }

  _focusTextInputOnChanges (toggleAtomWinCmdS: Bacon.Stream, togglePanelCmdS: Bacon.Stream) {
    return Bacon
      .mergeAll(
        atoms.createCommandStream('atom-workspace', 'textual-velocity:focus-on-search'),
        toggleAtomWinCmdS,
        togglePanelCmdS)
      .debounce(25) // ms
      .onValue(() => {
        const el: any = this._queryDOM('input')
        const input: HTMLInputElement = el
        if (input) {
          input.select()
          input.focus()
        }
      })
  }

  _togglePanelOnCmd (togglePanelCmdS: Bacon.Stream, panel: Atom$Panel) {
    return togglePanelCmdS
      .onValue(() => {
        if (panel.isVisible()) {
          panel.hide()
        } else {
          panel.show()
        }
      })
  }

  _toggleAtomWinOnCmd (toggleAtomWinCmdS: Bacon.Stream, panel: Atom$Panel) {
    return toggleAtomWinCmdS
      .onValue(() => {
        if (atom.getCurrentWindow().isFocused()) {
          if (panel.isVisible()) {
            atom.hide() // hide window
          } else {
            panel.show()
          }
        } else {
          atom.show()
          atom.focus()
          panel.show()
        }
      })
  }

  _renderLoadingOnLoadingEvent (presenter: PresenterType, view: ViewType) {
    return presenter.listHeightP
      .sampledBy(presenter.loadingS)
      .onValue(listHeight => {
        view.renderLoading(listHeight)
      })
  }

  _renderResultsOnDataChanges (presenter: PresenterType, view: ViewType) {
    return Bacon
      .combineTemplate({
        columns: presenter.columnHeadersP,
        forcedScrollTop: presenter.forcedScrollTopP,
        itemsCount: presenter.itemsCountP,
        listHeight: presenter.listHeightP,
        loadingProgress: presenter.loadingProgressP,
        paginationStart: presenter.paginationP.map('.start'),
        rowHeight: presenter.rowHeightP,
        rows: presenter.rowsS,
        searchStr: presenter.searchStrP,
        sort: presenter.sortP
      })
      .sampledBy(
        Bacon.mergeAll(
          presenter.listHeightP.changes(),
          presenter.forcedScrollTopP.changes(),
          presenter.rowsS))
      .onValue((params: ResultsViewParamsType) => {
        view.renderResults(params)
      })
  }

  _previewSelectedPath (selectedPathP: Bacon.Property, selectedContentP: Bacon.Property) {
    const preview = new PreviewElement()
    const PREVIEW_SCHEMA_PREFIX = 'tv://'

    return new Disposables(
      preview,
      atom.workspace.addOpener((uri) => {
        if (uri.startsWith(PREVIEW_SCHEMA_PREFIX)) {
          return preview
        }
      }),
      Bacon
        .combineTemplate({
          path: selectedPathP,
          content: selectedContentP
        })
        .debounce(25) // ms
        .onValue(({path, content}) => {
          // If selected item is the active text editor don't open a preview window
          const activeTextEditor = atom.workspace.getActiveTextEditor()
          if (activeTextEditor && activeTextEditor.getPath() === path) return

          if (path) {
            preview.setNote(path, content)
            atom.workspace.open(PREVIEW_SCHEMA_PREFIX + path, {
              activatePane: false,
              searchAllPanes: true
            })
          } else if (atom.workspace.getActivePaneItem() === preview) {
            // Only close preview upon deselecting item while the preview is active
            const pane = atom.workspace.paneForItem(preview)
            if (pane) {
              pane.destroyItem(preview)
            }
          }
        }))
  }

  _openTextEditorOnOpenEvent (openPathS: Bacon.Stream) {
    return openPathS
      .onValue((path: string) => {
        atom.workspace.open(path)
      })
  }

  _saveEditedCellOnSave (saveEditedCellContentS: Bacon.Stream, fileWritersP: Bacon.Property) {
    return fileWritersP
      .combine(saveEditedCellContentS, R.pair)
      .sampledBy(saveEditedCellContentS)
      .onValue(([fileWriters, {editCellName, path, str}]) => {
        fileWriters
          .find(fw => fw.editCellName === editCellName)
          .write(path, str, err => {
            if (err) {
              atom.notifications.addError(`Failed to save file ${path}:'`, {
                detail: err.message,
                stack: err.stack,
                dismissable: true
              })
            }
          })
      })
  }

  _updateConfigSchemaOnColumnsChange (columnsP: Bacon.Property) {
    return columnsP
      .onValue((columns: Array<ColumnType>) => {
        const schema = atom.config.getSchema('textual-velocity.sortField')
        schema.default = columns[0].sortField
        schema.enum = columns.map(column => ({
          value: column.sortField,
          description: column.title
        }))
        atom.config.setSchema('textual-velocity.sortField', schema)
      })
  }

  _informAboutRestartingSessionForChangesToTakeEffect () {
    const title = 'Textual Velocity'
    return new Disposables(
      atom.config.onDidChange('textual-velocity.path', () => {
        atom.notifications.addInfo(title, {
          description: 'Restart session to load notes from the new notes path'
        })
      }),
      atom.config.onDidChange('textual-velocity.ignoredNames', () => {
        atom.notifications.addInfo(title, {
          description: 'Restart the session to ignore/unignore notes by the changed ignored names'
        })
      }),
      atom.config.onDidChange('textual-velocity.excludeVcsIgnoredPaths', ({newValue}) => {
        atom.notifications.addInfo(title, {
          description: `Restart the session to ${newValue ? 'exclude' : 'include'} VCS-ignored paths`
        })
      })
    )
  }

}
