/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'

const UPDATE_ROW_HEIGHT_RATE_LIMIT = 50 // ms
const PERSIST_LIST_HEIGHT_RATE_LIMIT = 500 // ms
const FOCUS_TEXT_INPUT_RATE_LIMIT = 25 // ms
const PREVIEW_RATE_LIMIT = 50 // ms

export default class SideEffects {

  _disposables: DisposableType
  _panel: Atom$Panel

  constructor (panel: Atom$Panel, view: ViewType, presenter: PresenterType, service: ServiceType) {
    this._panel = panel
    const togglePanelCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-panel')
    const toggleAtomWinCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-atom-window')

    this._disposables = new DisposableValues(
      this._saveListHeightOnPanelResize(view.listHeightStream),
      this._saveSortDirectionOnChange(view),
      this._saveSortFieldOnChange(view),
      this._saveRowHeightOnWinResize(presenter),
      this._focusTextInputOnChanges(toggleAtomWinCmdStream, togglePanelCmdStream),
      this._toggleAtomWinOnCmd(panel, toggleAtomWinCmdStream),
      this._togglePanelOnCmd(panel, togglePanelCmdStream),
      this._renderLoadingOnLoadingEvent(presenter, view),
      this._renderResultsOnDataChanges(presenter, view),
      this._previewSelectedPath(presenter),
      this._openTextEditorOnOpenEvent(presenter),
      this._saveEditedCellOnSave(presenter, service.fileWritersProp),
      this._updateConfigSchemaOnColumnsChange(service.columnsProp)
    )
  }

  dispose () {
    this._disposables.dispose()
  }

  _queryDOM (selector: string): DOMNodeType | void {
    return this._panel.getItem().querySelector(selector)
  }

  _saveListHeightOnPanelResize (listHeightStream: Bacon.Stream) {
    return listHeightStream
      .debounce(PERSIST_LIST_HEIGHT_RATE_LIMIT)
      .onValue(listHeight => {
        atom.config.set('textual-velocity.listHeight', listHeight)
      })
  }

  _saveSortDirectionOnChange (view: ViewType) {
    return view
      .sortDirectionStream
      .onValue((direction: string) => {
        atom.config.set('textual-velocity.sortDirection', direction)
      })
  }

  _saveSortFieldOnChange (view: ViewType) {
    return view
      .sortFieldStream
      .onValue((field: string) => {
        atom.config.set('textual-velocity.sortField', field)
      })
  }

  _saveRowHeightOnWinResize (presenter: PresenterType) {
    return Bacon
      .mergeAll(
        presenter.rowsStream.take(1).delay(UPDATE_ROW_HEIGHT_RATE_LIMIT),
        Bacon.fromEvent(window, 'resize'))
      .debounce(UPDATE_ROW_HEIGHT_RATE_LIMIT)
      .onValue(() => {
        const td = this._queryDOM('td')
        if (td && td.clientHeight > 0) {
          atom.config.set('textual-velocity.rowHeight', td.clientHeight)
        }
      })
  }

  _focusTextInputOnChanges (toggleAtomWinCmdStream: Bacon.Stream, togglePanelCmdStream: Bacon.Stream) {
    return Bacon
      .mergeAll(
        atoms.createCommandStream('atom-workspace', 'textual-velocity:focus-on-search'),
        toggleAtomWinCmdStream,
        togglePanelCmdStream)
      .debounce(FOCUS_TEXT_INPUT_RATE_LIMIT)
      .onValue(() => {
        const el: any = this._queryDOM('input')
        const input: HTMLInputElement = el
        if (input) {
          input.select()
          input.focus()
        }
      })
  }

  _togglePanelOnCmd (panel: Atom$Panel, togglePanelCmdStream: Bacon.Stream) {
    return togglePanelCmdStream
      .onValue(() => {
        if (panel.isVisible()) {
          panel.hide()
        } else {
          panel.show()
        }
      })
  }

  _toggleAtomWinOnCmd (panel: Atom$Panel, toggleAtomWinCmdStream: Bacon.Stream) {
    return toggleAtomWinCmdStream
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
    return presenter.listHeightProp
      .sampledBy(presenter.loadingStream)
      .onValue(listHeight => {
        view.renderLoading(listHeight)
      })
  }

  _renderResultsOnDataChanges (presenter: PresenterType, view: ViewType) {
    return Bacon
      .combineTemplate({
        columns: presenter.columnHeadersProp,
        forcedScrollTop: presenter.forcedScrollTopProp,
        itemsCount: presenter.itemsCountProp,
        listHeight: presenter.listHeightProp,
        paginationStart: presenter.paginationProp.map('.start'),
        rowHeight: presenter.rowHeightProp,
        rows: presenter.rowsStream,
        searchStr: presenter.searchStrProp,
        sort: presenter.sortProp
      })
      .sampledBy(
        Bacon.mergeAll(
          presenter.listHeightProp.changes(),
          presenter.forcedScrollTopProp.changes(),
          presenter.rowsStream))
      .onValue((params: ResultsViewParamsType) => {
        view.renderResults(params)
      })
  }

  _previewSelectedPath (presenter: PresenterType) {
    return presenter.selectedPathStream
      .debounce(PREVIEW_RATE_LIMIT)
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
    return presenter.openPathStream
      .onValue((path: string) => {
        atom.workspace.open(path)
      })
  }

  _saveEditedCellOnSave (presenter: PresenterType, fileWritersProp: Bacon.Property) {
    return fileWritersProp
      .combine(presenter.saveEditedCellContentStream, R.pair)
      .sampledBy(presenter.saveEditedCellContentStream)
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

  _updateConfigSchemaOnColumnsChange (columnsProp: Bacon.Property) {
    return columnsProp
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
