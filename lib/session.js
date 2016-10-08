/* @flow */

import PathWatcherFactory from './path-watcher-factory'
import Interactor from './interactor'
import Presenter from './presenter'
import SideEffects from './side-effects'
import ViewCtrl from './view-ctrl'

export default class Session {

  _atomSideEffects: Object
  _panel: Atom$Panel
  _view: ViewType
  _viewCtrl: ViewCtrlType

  constructor (service: ServiceType, notes: Object) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })
    this._viewCtrl = new ViewCtrl(this._panel)

    const pathWatcherFactory = new PathWatcherFactory(service)
    const interactor = new Interactor(this._viewCtrl, pathWatcherFactory, service)
    const presenter = new Presenter(interactor, service.columnsP)
    this._atomSideEffects = new SideEffects(this._panel, this._viewCtrl, presenter, service)

    this._viewCtrl.activate(notes)
  }

  dispose () {
    this._viewCtrl.dispose()
    this._atomSideEffects.dispose()
    this._panel.destroy()
  }
}
