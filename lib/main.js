'use babel'

import DisposableValues from './disposable-values'
import * as reactRenderer from './react-renderer'
import Interactor from './interactor'
import ViewCtrl from './view-ctrl'
import Presenter from './presenter'

export default {

  activate (state) {
    // Setup env dependencies
    this._disposables = new DisposableValues()

    // Setup VIP cycle
    this._viewCtrl = new ViewCtrl(reactRenderer)
    this._presenter = new Presenter(this._viewCtrl)
    this._interactor = new Interactor(this._presenter)

    this._viewCtrl.setInteractor(this._interactor)
    this._viewCtrl.activate(state)
  },

  deactivate () {
    // Deactivate and dispose objects
    this._viewCtrl.deactivate()
    this._viewCtrl = null
    this._interactor = null
    this._presenter = null
    this._disposables.dispose()
    this._disposables = null
  }

}
