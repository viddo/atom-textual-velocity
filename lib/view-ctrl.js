'use babel'

import Bacon from 'baconjs'
import Path from 'path'
import fs from 'fs-plus'
import R from 'ramda'
import * as atoms from './atom-streams'
import getAdjustedScrollTop from './get-adjusted-scroll-top'
import DisposableValues from './disposable-values'
import {start as calcPaginationStart, limit as calcPaginationLimit} from './pagination'

const UPDATE_ROW_HEIGHT_RATE_LIMIT = 50 // ms
const PERSIST_LIST_HEIGHT_RATE_LIMIT = 500 // ms
const ENTER = 13
const ESC = 27
const UP = 38
const DOWN = 40

export default class ViewCtrl {

  constructor (aRenderer) {
    this._disposables = new DisposableValues()
    this._renderer = aRenderer

    this._loadingBus = new Bacon.Bus()
    this._resultsBus = new Bacon.Bus()
    this._textInputBus = new Bacon.Bus()
    this._keyDownBus = new Bacon.Bus()
    this._scrollTopBus = new Bacon.Bus()
    this._listHeightBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()
    this._rowClickBus = new Bacon.Bus()
  }

  setInteractor (anInteractor) {
    this._interactor = anInteractor
  }

  activate () {
    const cfg = atom.config.get('textual-velocity')

    let path = fs.normalize(cfg.path || 'notes')
    if (!Path.isAbsolute(path)) {
      path = Path.join(atom.configDirPath, path)
    }

    const rowHeightProp = atoms.createConfigStream('textual-velocity.rowHeight').skipDuplicates().toProperty(25)
    const listHeightProp = Bacon
      .mergeAll(
        this._listHeightBus,
        atoms.createConfigStream('textual-velocity.listHeight'))
      .skipDuplicates()
      .toProperty(100)

    const forcedScrollTopProp = this._forcedScrollTopProp(rowHeightProp, listHeightProp)
    const stateProp = this._loadingBus
      .withStateMachine({}, (state, event) => {
        let nextState
        const outputEvents = []

        if (event.hasValue()) {
          const DOMNode = document.createElement('div')
          nextState = {
            DOMNode: DOMNode,
            panel: atom.workspace.addTopPanel({item: DOMNode})
          }
          outputEvents.push(new Bacon.Next(nextState))
        } else if (event.isEnd() && state.DOMNode) {
          state.panel.destroy()
          this._renderer.remove(state.DOMNode)
          nextState = undefined
        } else {
          nextState = state
        }

        return [nextState, outputEvents]
      })

    const DOMNodeProp = stateProp.map('.DOMNode')
    const atomPanelProp = stateProp.map('.panel')
    const togglePanelCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-panel')
    const toggleAtomWinCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-atom-window')

    this._disposables.add(Bacon
      .combineTemplate({
        listHeight: listHeightProp,
        DOMNode: DOMNodeProp
      })
      .sampledBy(this._loadingBus)
      .onValue(this._renderer.renderLoading))

    this._disposables.add(
      Bacon
        .combineTemplate({
          DOMNode: DOMNodeProp,
          rowHeight: rowHeightProp,
          listHeight: listHeightProp,
          forcedScrollTop: forcedScrollTopProp,
          res: this._resultsBus,
          callbacks: {
            onSearch: str => this._textInputBus.push(str),
            onKeyDown: ev => this._keyDownBus.push(ev),
            onScroll: scrollTop => this._scrollTopBus.push(scrollTop),
            onClickRow: index => this._rowClickBus.push(index),
            onSortByField: field => this._sortFieldBus.push(field),
            onChangeSortDirection: direction => this._sortDirectionBus.push(direction),
            onResize: listHeight => this._listHeightBus.push(listHeight)
          }
        })
        .sampledBy(
          Bacon.mergeAll(
            this._resultsBus,
            forcedScrollTopProp
          ))
        .onValue(this._renderer.renderResults),

      this._searchOnTextInput(),
      this._updateStateOnKeyDown(),
      this._selectItemOnClick(),
      this._selectItemOnEditorChange(),
      this._openOrCreateItemOnEnter(),
      this._updateSortFieldOnChange(),
      this._updateSortDirectionOnChange(),
      this._updateListHeightOnPanelResize(),
      this._updateRowHeightOnWinResize(DOMNodeProp),
      this._focusTextInputOnChanges(DOMNodeProp, toggleAtomWinCmdStream, togglePanelCmdStream),
      this._togglePanelOnCmd(atomPanelProp, togglePanelCmdStream),
      this._toggleAtomWinOnCmd(atomPanelProp, toggleAtomWinCmdStream),
      this._paginateOnViewChange(forcedScrollTopProp, rowHeightProp, listHeightProp)
    )

    this._interactor.startSession({
      platform: process.platform,
      ignoredNames: atom.config.get('core.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('core.excludeVcsIgnoredPaths'),
      rootPath: path,
      sortField: cfg.sortField,
      sortDirection: cfg.sortDirection,
      paginationLimit: calcPaginationLimit({listHeight: cfg.listHeight, rowHeight: cfg.rowHeight})
    })
  }

  displayLoading (res) {
    this._loadingBus.push(res)
  }

  displayResults (res) {
    this._resultsBus.push(res)
  }

  displaySelectedItemPreview (path) {
    atom.workspace.open(path, {
      pending: true,
      activatePane: false,
      searchAllPanes: true
    })
  }

  displayItemContent (path) {
    atom.workspace.open(path)
  }

  deactivate () {
    this._interactor.stopSession()
    this._interactor = null
    this._loadingBus.end()
    this._loadingBus = null
    this._resultsBus.end()
    this._resultsBus = null
    this._textInputBus.end()
    this._textInputBus = null
    this._keyDownBus.end()
    this._keyDownBus = null
    this._scrollTopBus.end()
    this._scrollTopBus = null
    this._listHeightBus.end()
    this._listHeightBus = null
    this._sortFieldBus.end()
    this._sortFieldBus = null
    this._sortDirectionBus.end()
    this._sortDirectionBus = null
    this._rowClickBus.end()
    this._rowClickBus = null
    this._disposables.dispose()
  }

  _forcedScrollTopProp (rowHeightProp, listHeightProp) {
    const selectedIndexStream = this._resultsBus
      .map('.selectedIndex')
      .skipDuplicates()
      .filter(R.is(Number))

    const scrollTopProp = this._scrollTopBus.toProperty(0)

    return Bacon
      .update(
        undefined,
        [selectedIndexStream, scrollTopProp, rowHeightProp, listHeightProp], (forcedScrollTop, i, scrollTop, rowHeight, listHeight) => {
          return getAdjustedScrollTop({
            selectedIndex: i,
            scrollTop: forcedScrollTop || scrollTop,
            rowHeight: rowHeight,
            visibleHeight: listHeight
          })
        },
        [this._keyDownBus.filter(R.propEq('keyCode', ESC))], R.always(0),
        [this._textInputBus], R.always(0),
        [this._scrollTopBus], R.always(undefined))
      .skipDuplicates()
  }

  _searchOnTextInput () {
    return this._textInputBus
      .toProperty('')
      .skip(1) // to avoid initial values (not done by user) causing loading to not be seen
      .onValue(str => {
        this._interactor.search(str)
      })
  }

  _openOrCreateItemOnEnter () {
    return this._keyDownBus
      .filter(R.propEq('keyCode', ENTER))
      .onValue(() => {
        this._interactor.openOrCreateItem()
      })
  }

  _togglePanelOnCmd (atomPanelProp, togglePanelCmdStream) {
    return atomPanelProp
      .sampledBy(togglePanelCmdStream)
      .onValue(atomPanel => {
        if (atomPanel.isVisible()) {
          atomPanel.hide()
        } else {
          atomPanel.show()
        }
      })
  }

  _toggleAtomWinOnCmd (atomPanelProp, toggleAtomWinCmdStream) {
    return atomPanelProp
      .sampledBy(toggleAtomWinCmdStream)
      .onValue(atomPanel => {
        if (atom.getCurrentWindow().isFocused()) {
          if (atomPanel.isVisible()) {
            atom.hide() // hide window
          } else {
            atomPanel.show()
          }
        } else {
          atom.show()
          atom.focus()
          atomPanel.show()
        }
      })
  }

  _focusTextInputOnChanges (DOMNodeProp, toggleAtomWinCmdStream, togglePanelCmdStream) {
    return DOMNodeProp
      .sampledBy(Bacon
        .mergeAll(
          atoms.createCommandStream('atom-workspace', 'textual-velocity:focus-on-search'),
          toggleAtomWinCmdStream,
          togglePanelCmdStream
        ))
      .debounce(25)
      .onValue(DOMNode => {
        const input = DOMNode.querySelector('input')
        input.select()
        input.focus()
      })
  }

  _paginateOnViewChange (forcedScrollTopProp, rowHeightProp, listHeightProp) {
    const startProp = Bacon
      .combineTemplate({
        scrollTop: Bacon.mergeAll(forcedScrollTopProp, this._scrollTopBus),
        rowHeight: rowHeightProp
      })
      .map(calcPaginationStart)
      .skipDuplicates()

    const limitProp = Bacon
      .combineTemplate({
        listHeight: listHeightProp,
        rowHeight: rowHeightProp
      })
      .map(calcPaginationLimit)
      .skipDuplicates()

    return Bacon
      .combineTemplate({
        start: startProp,
        limit: limitProp
      })
      .skip(1)  // to avoid initial values (not done by user) causing loading to not be seen
      .onValue(params => {
        this._interactor.paginate(params)
      })
  }

  _selectItemOnClick () {
    return this._rowClickBus
      .onValue(index => {
        this._interactor.selectByIndex(index)
      })
  }

  _selectItemOnEditorChange () {
    return atoms
      .createStream(atom.workspace, 'observeActivePaneItem')
      .map('.buffer.getPath')
      .onValue(path => {
        this._interactor.selectByPath(path)
      })
  }

  _updateSortFieldOnChange () {
    return this._sortFieldBus
      .onValue(field => {
        this._interactor.sortByField(field)
        atom.config.set('textual-velocity.sortField', field)
      })
  }

  _updateSortDirectionOnChange () {
    return this._sortDirectionBus
      .onValue(direction => {
        this._interactor.sortDirection(direction)
        atom.config.set('textual-velocity.sortDirection', direction)
      })
  }

  _updateRowHeightOnWinResize (DOMNodeProp) {
    return DOMNodeProp
      .sampledBy(
        Bacon.mergeAll(
          this._resultsBus.skip(1).take(1),
          Bacon.fromEvent(window, 'resize')
        ))
      .debounce(UPDATE_ROW_HEIGHT_RATE_LIMIT)
      .onValue(DOMNode => {
        const td = DOMNode.querySelector('td')
        if (td && td.clientHeight > 0) {
          atom.config.set('textual-velocity.rowHeight', td.clientHeight)
        }
      })
  }

  _updateListHeightOnPanelResize () {
    return this._listHeightBus
      .skipDuplicates()
      .debounce(PERSIST_LIST_HEIGHT_RATE_LIMIT)
      .onValue(listHeight => {
        atom.config.set('textual-velocity.listHeight', listHeight)
      })
  }

  _updateStateOnKeyDown () {
    return Bacon
      .onValues(this._keyDownBus, (ev) => {
        switch (ev.keyCode) {
          case ESC:
            return this._interactor.search('')
          case UP:
            ev.preventDefault()
            return this._interactor.selectPrev()
          case DOWN:
            ev.preventDefault()
            return this._interactor.selectNext()
        }
      })
  }

}
