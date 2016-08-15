/* @flow */

import * as pathWatcherFactory from './path-watcher-factory'
import * as reactRenderer from './react-renderer'
import Summary from './columns/summary'
import DateColumn from './columns/date-column'
import Interactor from './interactor'
import ViewCtrl from './view-ctrl'
import Presenter from './presenter'

export default {

  activate (state?: Object) {
    this._viewCtrl = new ViewCtrl(reactRenderer)

    const columns = [
      new Summary(),
      new DateColumn({id: 'created_at', title: 'Created', field: 'createdTime'}),
      new DateColumn({id: 'last_updated_at', title: 'Updated', field: 'lastUpdatedTime'})
    ]
    this._presenter = new Presenter(this._viewCtrl, columns)

    this._viewCtrl.interactor = new Interactor(this._presenter, pathWatcherFactory)
    this._viewCtrl.activate()
  },

  deactivate () {
    this._viewCtrl.deactivate()
    this._viewCtrl.interactor = null // break cyclic dependency, so objects can be garbage collected
    this._viewCtrl = null
    this._interactor = null
    this._presenter = null
  }

}
