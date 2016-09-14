/* @flow */

import PathWatcherFactory from './path-watcher-factory'
import Interactor from './interactor'
import Presenter from './presenter'
import ReactView from './react-view'
import SideEffects from './side-effects'
import ViewCtrl from './view-ctrl'

export default class Session {

  _atomSideEffects: Object
  _panel: Atom$Panel
  _view: ViewType
  _viewCtrl: ViewCtrlType

  constructor (service: ServiceType) {
    this._panel = atom.workspace.addTopPanel({
      item: document.createElement('div')
    })
    this._view = new ReactView(this._panel)
    this._viewCtrl = new ViewCtrl(this._view)

    const pathWatcherFactory = new PathWatcherFactory(service.fileReadersProp)
    const interactor = new Interactor(this._viewCtrl, pathWatcherFactory, service)
    const presenter = new Presenter(interactor, service.columnsProp)
    this._atomSideEffects = new SideEffects(this._panel, this._view, presenter, service)

    this._viewCtrl.activate()
  }

  dispose () {
    this._viewCtrl.deactivate()
    this._atomSideEffects.dispose()
    this._view.dispose()
    this._panel.destroy()
  }
}
