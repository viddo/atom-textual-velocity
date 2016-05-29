'use babel'

import DisposableValues from './disposable-values'
import Logger from './logger'
import Interactor from './interactor'
import ViewCtrl from './view-ctrl'
import Presenter from './presenter'

export default {

  activate (state) {
    // Setup env dependencies
    this._disposables = new DisposableValues()
    this._logger = new Logger({env: 'main package'})
    atom.config.observe('textual-velocity.enableDeveloperConsoleLog', (enabled) => {
      this._logger.toggle(enabled)
    })

    // Setup VIP cycle
    this._viewCtrl = new ViewCtrl()
    this._presenter = new Presenter(this._viewCtrl)
    this._interactor = new Interactor({presenter: this._presenter, logger: this._logger, disposables: this._disposables})

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
