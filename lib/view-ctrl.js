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
  }

  setInteractor (anInteractor) {
    this._interactor = anInteractor
    this._setupSideEffects()
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

  displayLoading (res) { this._loadingBus.push(res) }
  displayResults (res) { this._resultsBus.push(res) }

  deactivate () {
    this._interactor.stopSession()
    this._interactor = null
    this._loadingBus.end()
    this._resultsBus.end()
    this._searchBus.end()
    this._scrollTopBus.end()
    this._listHeightBus.end()
    this._disposables.dispose()
  }

  _setupSideEffects () {
    const rowHeightProp = atoms.createConfigStream('textual-velocity.rowHeight').toProperty(25)
    const listHeightProp = Bacon
      .mergeAll(
        atoms.createConfigStream('textual-velocity.listHeight'),
        this._listHeightBus.skipDuplicates()
      )
      .toProperty(100)

    // "returns and array containing the next state and an array of output events"
    const DOMNodeProp = this._loadingBus
      .withStateMachine({}, (state, event) => {
        if (event.hasValue()) {
          const DOMNode = document.createElement('div')
          const state = {DOMNode: DOMNode, panel: atom.workspace.addTopPanel({item: DOMNode})}
          return [state, [new Bacon.Next(state)]]
        } else if (event.isEnd() && state.DOMNode) {
          this._renderer.remove(state.DOMNode)
          state.panel.destroy()
          state.DOMNode = null
          return [undefined, []]
        } else {
          return [state, []]
        }
      })
      .map('.DOMNode')
      .toProperty()

    // Render loading
    this._disposables.add(Bacon
      .combineTemplate({
        listHeight: listHeightProp,
        DOMNode: DOMNodeProp
      })
      .sampledBy(this._loadingBus)
      .onValue(this._renderer.renderLoading))

    // Search results
    this._disposables.add(Bacon
      .combineTemplate({
        DOMNode: DOMNodeProp,
        listHeight: listHeightProp,
        rowHeight: rowHeightProp,
        res: this._resultsBus,
        onSearch: Bacon.constant(str => { this._searchBus.push(str) }),
        onScroll: Bacon.constant(scrollTop => this._scrollTopBus.push(scrollTop)),
        onResize: Bacon.constant(listHeight => this._listHeightBus.push(listHeight))
      })
      .sampledBy(this._resultsBus)
      .onValue(this._renderer.renderResults))

    // Search filters
    this._disposables.add(Bacon
      .combineTemplate({
        str: this._searchBus.toProperty(''),
        start: Bacon
          .combineTemplate({
            scrollTop: this._scrollTopBus.skipDuplicates()
              .merge(this._searchBus.map(0)).toProperty(0), // reset scroll on search
            rowHeight: rowHeightProp
          })
          .map(paginationStart),
        limit: Bacon
          .combineTemplate({listHeight: listHeightProp, rowHeight: rowHeightProp})
          .map(paginationLimit)
      })
      .skip(1) // don't trigger on first
      .onValue(filter => {
        this._interactor.search(filter)
      }))

    this._updateRowHeightOnWinResize(DOMNodeProp)
    this._updateListHeightOnPanelResize()
  }

  _updateRowHeightOnWinResize (DOMNodeProp) {
    this._disposables.add(DOMNodeProp
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
