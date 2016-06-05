'use babel'

import Bacon from 'baconjs'
import * as atoms from './atom-streams'
import newPagination from './new-pagination'

export default class ViewCtrl {

  constructor (aRenderer) {
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

    Bacon
      .combineTemplate({
        listHeight: listHeightProp,
        DOMNode: DOMNodeProp
      })
      .sampledBy(this._loadingBus)
      .onValue(this._renderer.renderLoading)

    Bacon
      .combineTemplate({
        DOMNode: DOMNodeProp,
        interactor: Bacon.constant(this._interactor),
        listHeight: listHeightProp,
        rowHeight: rowHeightProp,
        res: this._resultsBus
      })
      .sampledBy(this._resultsBus)
      .onValue(this._renderer.renderResults)
  }

}
