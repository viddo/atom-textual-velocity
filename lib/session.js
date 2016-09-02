/* @flow */

import * as pathWatcherFactory from './path-watcher-factory'
import DateColumn from './columns/date-column'
import Interactor from './interactor'
import Presenter from './presenter'
import ReactView from './react-view'
import SideEffects from './side-effects'
import Summary from './columns/summary'
import ViewCtrl from './view-ctrl'

export default class Session {

  _atomSideEffects: Object
  _panel: Atom$Panel
  _view: ViewType
  _viewCtrl: ViewCtrlType

  constructor () {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })
    this._view = new ReactView(this._panel)
    this._viewCtrl = new ViewCtrl(this._view)

    const columns = [
      new Summary(),
      new DateColumn({
        title: 'Created',
        field: 'createdTime'
      }),
      new DateColumn({
        title: 'Updated',
        field: 'lastUpdatedTime'
      })
    ]
    const interactor = new Interactor(this._viewCtrl, pathWatcherFactory)
    const presenter = new Presenter(interactor, columns)
    this._atomSideEffects = new SideEffects(this._panel, this._view, presenter)

    this._viewCtrl.activate()
  }

  dispose () {
    this._atomSideEffects.dispose()
    this._viewCtrl.deactivate()
    this._view.dispose()
    this._panel.destroy()
  }
}
