/* @flow */

import * as pathWatcherFactory from './path-watcher-factory'
import ReactView from './react-view'
import Summary from './columns/summary'
import DateColumn from './columns/date-column'
import Interactor from './interactor'
import ViewCtrl from './view-ctrl'
import Presenter from './presenter'

export default {

  activate (state?: Object) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div'),
      visible: false
    })
    this._view = new ReactView(this._panel)
    this._viewCtrl = new ViewCtrl(this._panel, this._view)

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
    this._view.dispose()
    this._view = null
    this._panel.destroy()
    this._panel = null
    this._interactor = null
    this._presenter = null
  }

}
