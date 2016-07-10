'use babel'

import Bacon from 'baconjs'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import {start as paginationStart, limit as paginationLimit} from './pagination'

const UPDATE_ROW_HEIGHT_RATE_LIMIT = 50 // ms
const PERSIST_LIST_HEIGHT_RATE_LIMIT = 1000 // ms
const ESC = 27

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

    this._scrollTopBus.plug(this._textInputBus.map(0))
    this._scrollTopBus.plug(this._keyDownBus.map(0))

    this._rowHeightProp = atoms.createConfigStream('textual-velocity.rowHeight').toProperty(25)
    this._listHeightProp = Bacon
      .mergeAll(
        atoms.createConfigStream('textual-velocity.listHeight'),
        this._listHeightBus.skipDuplicates()
      )
      .toProperty(100)

    this._DOMNodeProp = this._loadingBus
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

  setInteractor (anInteractor) {
    this._interactor = anInteractor
  }

  activate () {
    const cfg = atom.config.get('textual-velocity')

    this._interactor.startSession({
      platform: process.platform,
      ignoredNames: atom.config.get('core.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('core.excludeVcsIgnoredPaths'),
      rootPath: cfg.path,
      sortField: cfg.sortField,
      sortDirection: cfg.sortDirection,
      paginationLimit: paginationLimit({listHeight: cfg.listHeight, rowHeight: cfg.rowHeight})
    })
  }

  // As defined by Presenter
  displayLoading (res) {
    if (!this._disposeRenderLoading) {
      this._disposeLoading = Bacon
        .combineTemplate({
          listHeight: this._listHeightProp,
          DOMNode: this._DOMNodeProp
        })
        .sampledBy(this._loadingBus)
        .onValue(this._renderer.renderLoading)
    }

    this._loadingBus.push(res)
  }

  // As defined by Presenter
  displayResults (res) {
    if (!this._disposeRenderResults) {
      this._searchOnTextInput()
      this._paginateOnViewChange()
      this._selectItemByClick()
      this._updateSortFieldOnChange()
      this._updateSortDirectionOnChange()
      this._updateRowHeightOnWinResize()
      this._updateListHeightOnPanelResize()

      this._disposeRenderResults = Bacon
        .combineTemplate({
          DOMNode: this._DOMNodeProp,
          rowHeight: this._rowHeightProp,
          listHeight: this._listHeightProp,
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
        .sampledBy(this._resultsBus)
        .onValue(this._renderer.renderResults)
    }

    this._resultsBus.push(res)
  }

  deactivate () {
    this._interactor.stopSession()
    this._interactor = null
    this._loadingBus.end()
    this._resultsBus.end()
    this._textInputBus.end()
    this._scrollTopBus.end()
    this._listHeightBus.end()
    this._rowClickBus.end()
    this._disposables.dispose()
    if (this._disposeRenderLoading) this._disposeRenderLoading()
    if (this._disposeRenderResults) this._disposeRenderResults()
    this._listHeightProp = null
    this._rowHeightProp = null
    this._DOMNodeProp = null
  }

  _searchOnTextInput () {
    this._disposables.add(
      this._textInputBus
        .toProperty('')
        .skip(1) // to avoid initial values (not done by user) causing loading to not be seen
        .onValue(str => {
          this._interactor.search(str)
        }))

    this._disposables.add(
      this._keyDownBus
        .filter(({keyCode}) => keyCode === ESC)
        .onValue(() => {
          this._interactor.search('')
        }))
  }

  _paginateOnViewChange () {
    const startProp = Bacon
      .combineTemplate({
        scrollTop: this._scrollTopBus
          .skipDuplicates()
          .toProperty(0),
        rowHeight: this._rowHeightProp
      })
      .map(paginationStart)

    const limitProp = Bacon
      .combineTemplate({
        listHeight: this._listHeightProp,
        rowHeight: this._rowHeightProp
      })
      .map(paginationLimit)

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

  _selectItemByClick () {
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
        this._interactor.changeSortDirection()
        atom.config.set('textual-velocity.sortDirection', direction)
      }))
  }

  _updateRowHeightOnWinResize () {
    this._disposables.add(this._DOMNodeProp
      .sampledBy(Bacon.fromEvent(window, 'resize'))
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
