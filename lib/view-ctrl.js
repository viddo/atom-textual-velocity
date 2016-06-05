'use babel'

import Bacon from 'baconjs'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import newPagination from './new-pagination'

const UPDATE_ROW_HEIGHT_RATE_LIMIT = 50 // ms

export default class ViewCtrl {

  constructor (aRenderer) {
    this._disposables = new DisposableValues()
    this._renderer = aRenderer
    this._eventsBus = new Bacon.Bus()
    this._loadingBus = new Bacon.Bus()
    this._resultsBus = new Bacon.Bus()
    this._scrollTopBus = new Bacon.Bus()
  }

  setInteractor (anInteractor) {
    this._interactor = anInteractor
    this._setupSideEffects()
  }

  activate () {
    const cfg = atom.config.get('textual-velocity')
    const pagination = newPagination({listHeight: cfg.listHeight, rowHeight: cfg.rowHeight})

    this._interactor.startSession({
      platform: process.platform,
      ignoredNames: atom.config.get('core.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('core.excludeVcsIgnoredPaths'),
      rootPath: cfg.path,
      sortField: cfg.sortField,
      sortDirection: cfg.sortDirection,
      paginationLimit: pagination.limit
    })
  }

  displayLoading (res) { this._loadingBus.push(res) }
  displayResults (res) { this._resultsBus.push(res) }

  deactivate () {
    this._interactor.stopSession()
    this._interactor = null
    this._loadingBus.end()
    this._resultsBus.end()
    this._scrollTopBus.end()
    this._disposables.dispose()
  }

  _setupSideEffects () {
    const listHeightProp = atoms.createConfigStream('textual-velocity.listHeight').toProperty(100)
    const rowHeightProp = atoms.createConfigStream('textual-velocity.rowHeight').toProperty(25)

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

    this._renderOnLoading({
      listHeight: listHeightProp,
      DOMNode: DOMNodeProp
    })

    this._renderOnResults({
      DOMNode: DOMNodeProp,
      interactor: Bacon.constant(this._interactor),
      listHeight: listHeightProp,
      rowHeight: rowHeightProp,
      res: this._resultsBus
    })

    this._updateRowHeightOnWinResize(DOMNodeProp)
  }

  _renderOnLoading (template) {
    this._disposables.add(Bacon
      .combineTemplate(template)
      .sampledBy(this._loadingBus)
      .onValue(this._renderer.renderLoading))
  }

  _renderOnResults (template) {
    this._disposables.add(Bacon
      .combineTemplate(template)
      .sampledBy(this._resultsBus)
      .onValue(this._renderer.renderResults))
  }

  _updateRowHeightOnWinResize (DOMNodeProp) {
    this._disposables.add(
      DOMNodeProp
        .sampledBy(Bacon.fromEvent(window, 'resize'))
        .debounce(UPDATE_ROW_HEIGHT_RATE_LIMIT)
        .onValue(DOMNode => {
          const td = DOMNode.querySelector('td')
          if (td && td.clientHeight > 0) {
            atom.config.set('textual-velocity.rowHeight', td.clientHeight)
          }
        }))
  }

}
