'use babel'

import Bacon from 'baconjs'
import memoize from 'memoize-decorator'
import R from 'ramda'
import * as atoms from './atom-streams'
import getAdjustedScrollTop from './get-adjusted-scroll-top'
import DisposableValues from './disposable-values'
import {start as calcPaginationStart, limit as calcPaginationLimit} from './pagination'

const UPDATE_ROW_HEIGHT_RATE_LIMIT = 50 // ms
const PERSIST_LIST_HEIGHT_RATE_LIMIT = 500 // ms
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

    this._setupOnceRenderLoading()
    this._setupOnceRenderResults()

    this._interactor.startSession({
      platform: process.platform,
      ignoredNames: atom.config.get('core.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('core.excludeVcsIgnoredPaths'),
      rootPath: cfg.path,
      sortField: cfg.sortField,
      sortDirection: cfg.sortDirection,
      paginationLimit: calcPaginationLimit({listHeight: cfg.listHeight, rowHeight: cfg.rowHeight})
    })
  }

  // As defined by Presenter
  displayLoading (res) {
    this._loadingBus.push(res)
  }

  // As defined by Presenter
  displayResults (res) {
    this._resultsBus.push(res)
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

  @memoize _setupOnceRenderLoading () {
    this._disposables.add(Bacon
      .combineTemplate({
        listHeight: this._listHeightProp,
        DOMNode: this._DOMNodeProp
      })
      .sampledBy(this._loadingBus)
      .onValue(this._renderer.renderLoading))
  }

  @memoize _setupOnceRenderResults () {
    this._searchOnTextInput()
    this._paginateOnViewChange()
    this._updateStateOnKeyDown()
    this._selectItemOnClick()
    this._updateSortFieldOnChange()
    this._updateSortDirectionOnChange()
    this._updateRowHeightOnWinResize()
    this._updateListHeightOnPanelResize()

    this._disposables.add(Bacon
      .combineTemplate({
        DOMNode: this._DOMNodeProp,
        rowHeight: this._rowHeightProp,
        listHeight: this._listHeightProp,
        forcedScrollTop: this._forcedScrollTopProp,
        res: this._resultsBus,
        callbacks: {
          onSearch: Bacon.constant(str => this._textInputBus.push(str)),
          onKeyDown: Bacon.constant(ev => this._keyDownBus.push(ev)),
          onScroll: Bacon.constant(scrollTop => this._scrollTopBus.push(scrollTop)),
          onClickRow: Bacon.constant(index => this._rowClickBus.push(index)),
          onSortByField: Bacon.constant(field => this._sortFieldBus.push(field)),
          onChangeSortDirection: Bacon.constant(direction => this._sortDirectionBus.push(direction)),
          onResize: Bacon.constant(listHeight => this._listHeightBus.push(listHeight))
        }
      })
      .sampledBy(
        Bacon.mergeAll(
          this._resultsBus,
          this._forcedScrollTopProp
        ))
      .onValue(this._renderer.renderResults))
  }

  @memoize get _forcedScrollTopProp () {
    const selectedIndexStream = this._resultsBus
      .map('.selectedIndex')
      .skipDuplicates()
      .filter(R.is(Number))

    const scrollTopProp = this._scrollTopBus.toProperty(0)

    return Bacon
      .update(
        undefined,
        [selectedIndexStream, scrollTopProp, this._rowHeightProp, this._listHeightProp], (forcedScrollTop, i, scrollTop, rowHeight, listHeight) => {
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

  @memoize get _rowHeightProp () {
    return atoms.createConfigStream('textual-velocity.rowHeight').skipDuplicates().toProperty(25)
  }

  @memoize get _listHeightProp () {
    return Bacon
      .mergeAll(
        this._listHeightBus,
        atoms.createConfigStream('textual-velocity.listHeight'))
      .skipDuplicates()
      .toProperty(100)
  }

  @memoize get _DOMNodeProp () {
    return this._loadingBus
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
      .map('.DOMNode')
      .toProperty()
  }

  _searchOnTextInput () {
    this._disposables.add(
      this._textInputBus
        .toProperty('')
        .skip(1) // to avoid initial values (not done by user) causing loading to not be seen
        .onValue(str => {
          this._interactor.search(str)
        }))
  }

  _updateStateOnKeyDown () {
    this._disposables.add(Bacon
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
      }))
  }

  _paginateOnViewChange () {
    const startProp = Bacon
      .combineTemplate({
        scrollTop: Bacon.mergeAll(this._forcedScrollTopProp, this._scrollTopBus),
        rowHeight: this._rowHeightProp
      })
      .map(calcPaginationStart)
      .skipDuplicates()

    const limitProp = Bacon
      .combineTemplate({
        listHeight: this._listHeightProp,
        rowHeight: this._rowHeightProp
      })
      .map(calcPaginationLimit)
      .skipDuplicates()

    this._disposables.add(Bacon
      .combineTemplate({
        start: startProp,
        limit: limitProp
      })
      .skip(1)  // to avoid initial values (not done by user) causing loading to not be seen
      .onValue(params => {
        this._interactor.paginate(params)
      }))
  }

  _selectItemOnClick () {
    this._disposables.add(
      this._rowClickBus
        .onValue(index => {
          this._interactor.selectByIndex(index)
        }))
  }

  _updateSortFieldOnChange () {
    this._disposables.add(
      this._sortFieldBus.onValue(field => {
        this._interactor.sortByField(field)
        atom.config.set('textual-velocity.sortField', field)
      }))
  }

  _updateSortDirectionOnChange () {
    this._disposables.add(
      this._sortDirectionBus.onValue(direction => {
        this._interactor.sortDirection(direction)
        atom.config.set('textual-velocity.sortDirection', direction)
      }))
  }

  _updateRowHeightOnWinResize () {
    this._disposables.add(this._DOMNodeProp
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
      }))
  }

  _updateListHeightOnPanelResize () {
    this._disposables.add(this._listHeightBus
      .skipDuplicates()
      .debounce(PERSIST_LIST_HEIGHT_RATE_LIMIT)
      .onValue(listHeight => {
        atom.config.set('textual-velocity.listHeight', listHeight)
      }))
  }

}
