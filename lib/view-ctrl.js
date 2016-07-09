'use babel'

import Bacon from 'baconjs'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import {start as paginationStart, limit as paginationLimit} from './pagination'

const UPDATE_ROW_HEIGHT_RATE_LIMIT = 50 // ms
const PERSIST_LIST_HEIGHT_RATE_LIMIT = 1000 // ms

export default class ViewCtrl {

  constructor (aRenderer) {
    this._disposables = new DisposableValues()
    this._renderer = aRenderer
    this._loadingBus = new Bacon.Bus()
    this._resultsBus = new Bacon.Bus()
    this._searchBus = new Bacon.Bus()
    this._scrollTopBus = new Bacon.Bus()
    this._listHeightBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()

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
      this._searchOnViewChanges()
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
            onSearch: Bacon.constant(str => this._searchBus.push(str)),
            onScroll: Bacon.constant(scrollTop => this._scrollTopBus.push(scrollTop)),
            onResize: Bacon.constant(listHeight => this._listHeightBus.push(listHeight)),
            onSortByField: Bacon.constant(field => this._sortFieldBus.push(field)),
            onChangeSortDirection: Bacon.constant(() => this._sortDirectionBus.push(true))
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
    this._searchBus.end()
    this._scrollTopBus.end()
    this._listHeightBus.end()
    this._disposables.dispose()
    if (this._disposeRenderLoading) this._disposeRenderLoading()
    if (this._disposeRenderResults) this._disposeRenderResults()
    this._listHeightProp = null
    this._rowHeightProp = null
    this._DOMNodeProp = null
  }

  _searchOnViewChanges () {
    const startProp = Bacon
      .combineTemplate({
        scrollTop: this._scrollTopBus.skipDuplicates().merge(this._searchBus.map(0)).toProperty(0), // reset scroll on search
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
        str: this._searchBus.toProperty(''),
        start: startProp,
        limit: limitProp
      })
      .skip(1) // don't trigger on first
      .onValue(filter => {
        this._interactor.search(filter)
      }))
  }

  _updateSortFieldOnChange () {
    this._disposables.add(
      this._sortFieldBus.onValue(field => {
        this._interactor.sortByField(field)
      }))
  }

  _updateSortDirectionOnChange () {
    this._disposables.add(
      this._sortDirectionBus.onValue(() => {
        this._interactor.changeSortDirection()
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
