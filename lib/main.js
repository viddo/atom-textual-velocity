'use babel'

import * as reactRenderer from './react-renderer'
import Summary from './columns/summary'
import DateColumn from './columns/date-column'
import Interactor from './interactor'
import ViewCtrl from './view-ctrl'
import Presenter from './presenter'

export default {

  activate (state) {
    this._viewCtrl = new ViewCtrl(reactRenderer)

    this._presenter = new Presenter({
      viewCtrl: this._viewCtrl,
      columns: [
        new Summary(),
        new DateColumn({id: 'created_at', title: 'Created', field: 'createdTime'}),
        new DateColumn({id: 'last_updated_at', title: 'Updated', field: 'lastUpdatedTime'})
      ]
    })
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
  }

}
