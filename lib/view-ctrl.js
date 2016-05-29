'use babel'

import {React, ReactDOM} from 'react-for-atom'
import ListPagination from './value-objects/list-pagination'
import LoadingComponent from './react/loading'
import PanelComponent from './react/panel'

export default class ViewCtrl {

  setInteractor (aInteractor) {
    this.interactor = aInteractor
  }

  activate () {
    const cfg = atom.config.get('textual-velocity')
    this.interactor.startSession({
      platform: process.platform,
      ignoredNames: atom.config.get('core.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('core.excludeVcsIgnoredPaths'),
      rootPath: cfg.path,
      sortField: cfg.sortField,
      sortDirection: cfg.sortDirection,

      // the item height depends on how Atom renders the HTML elements, might be adjusted later if necessary
      pagination: new ListPagination({listHeight: cfg.panelHeight, itemHeight: '20'})
    })
  }

  displayLoading () {
    this._renderDOM(
      <div className='textual-velocity' style={{height: atom.config.get('textual-velocity.panelHeight'), overflow: 'auto'}}>
        <LoadingComponent />
      </div>
    )
  }

  displayResults (viewModel) {
    this._renderDOM(<PanelComponent
      columns={viewModel.columns}
      rows={viewModel.rows}
      search={str => this.interactor.search(str)}
      panelHeight={atom.config.get('textual-velocity.panelHeight')}
    />)
  }

  _renderDOM (component) {
    if (!this.domNode) {
      this.domNode = document.createElement('div')
      this.atomPanel = atom.workspace.addTopPanel({item: this.domNode})
    }
    ReactDOM.render(component, this.domNode)
  }

  deactivate () {
    this.interactor.stopSession()
    this.interactor = null

    if (this.domNode) {
      ReactDOM.unmountComponentAtNode(this.domNode)
      this.domNode = null
      this.atomPanel.destroy()
    }
  }

}
