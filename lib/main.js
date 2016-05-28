'use babel'

import Interactor from './interactor'
import ViewCtrl from './view-ctrl'
import Presenter from './presenter'

export default {

  activate (state) {
    this.viewCtrl = new ViewCtrl(atom.config.get('textual-velocity.contextDesc'))
    this.presenter = new Presenter(this.viewCtrl)
    this.interactor = new Interactor(this.presenter)
    this.viewCtrl.setInteractor(this.interactor)

    this.viewCtrl.activate(state)
  },

  deactivate () {
    this.viewCtrl.deactivate()
    this.viewCtrl = null
    this.interactor = null
    this.presenter = null
  }

}
