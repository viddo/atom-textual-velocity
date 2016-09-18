/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'

export default class SideEffects {

  _disposables: DisposableType
  _panel: Atom$Panel

  constructor (panel: Atom$Panel, view: ViewType, presenter: PresenterType, service: ServiceType) {
    this._panel = panel
    const togglePanelCmdS = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-panel')
    const toggleAtomWinCmdS = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-atom-window')

    this._disposables = new DisposableValues(
      this._saveListHeightOnPanelResize(view.listHeightS),
      this._saveSortDirectionOnChange(view),
      this._saveSortFieldOnChange(view),
      this._saveRowHeightOnWinResize(presenter),
      this._focusTextInputOnChanges(toggleAtomWinCmdS, togglePanelCmdS),
      this._toggleAtomWinOnCmd(panel, toggleAtomWinCmdS),
      this._togglePanelOnCmd(panel, togglePanelCmdS),
      this._renderLoadingOnLoadingEvent(presenter, view),
      this._renderResultsOnDataChanges(presenter, view),
      this._previewSelectedPath(presenter),
      this._openTextEditorOnOpenEvent(presenter),
      this._saveEditedCellOnSave(presenter, service.fileWritersP),
      this._updateConfigSchemaOnColumnsChange(service.columnsP)
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

  _saveSortDirectionOnChange (view: ViewType) {
    return view
      .sortDirectionS
      .onValue((direction: string) => {
        atom.config.set('textual-velocity.sortDirection', direction)
      })
  }

  _saveSortFieldOnChange (view: ViewType) {
    return view
      .sortFieldS
      .onValue((field: string) => {
        atom.config.set('textual-velocity.sortField', field)
      })
  }

  _saveRowHeightOnWinResize (presenter: PresenterType) {
    return Bacon
      .mergeAll(
        presenter.rowsS.take(1),
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

  _togglePanelOnCmd (panel: Atom$Panel, togglePanelCmdS: Bacon.Stream) {
    return togglePanelCmdS
      .onValue(() => {
        if (panel.isVisible()) {
          panel.hide()
        } else {
          panel.show()
        }
      })
  }

  _toggleAtomWinOnCmd (panel: Atom$Panel, toggleAtomWinCmdS: Bacon.Stream) {
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

  _previewSelectedPath (presenter: PresenterType) {
    return presenter.selectedPathS
      .debounce(50) // ms
      .diff(undefined, (prevFile, selectedFile) => [prevFile, selectedFile])
      .onValue(([oldPath, newPath]) => {
        if (newPath) {
          atom.workspace.open(newPath, {
            pending: true,
            activatePane: false,
            searchAllPanes: true
          })
        } else if (oldPath) {
          const editor = atom.workspace.getTextEditors().find(editor => editor.getPath() === oldPath)
          if (editor) {
            editor.destroy()
          }
        }
      })
  }

  _openTextEditorOnOpenEvent (presenter: PresenterType) {
    return presenter.openPathS
      .onValue((path: string) => {
        atom.workspace.open(path)
      })
  }

  _saveEditedCellOnSave (presenter: PresenterType, fileWritersP: Bacon.Property) {
    return fileWritersP
      .combine(presenter.saveEditedCellContentS, R.pair)
      .sampledBy(presenter.saveEditedCellContentS)
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

}
