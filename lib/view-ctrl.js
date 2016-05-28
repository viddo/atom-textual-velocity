'use babel'

import {React, ReactDOM} from 'react-for-atom'
import Loading from './react/loading'
import PreviewFiles from './react/preview-files'

export default class ViewCtrl {

  constructor (contextDesc) {
    this.contextDesc = contextDesc
  }

  setInteractor (aInteractor) {
    this.interactor = aInteractor
  }

  activate () {
    this.interactor.startSession({
      contextDesc: this.contextDesc,
      platform: process.platform,
      ignoredNames: atom.config.get('core.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('core.excludeVcsIgnoredPaths'),
      rootPath: atom.config.get('textual-velocity.path')
    })
  }

  displayLoading () {
    this._renderDOM(<Loading />)
  }

  previewFiles (filenames) {
    this._renderDOM(<PreviewFiles filenames={filenames} />)
  }

  _renderDOM (contentComponent) {
    if (!this.domNode) {
      this.domNode = document.createElement('div')
      this.atomPanel = atom.workspace.addTopPanel({item: this.domNode})
    }
    ReactDOM.render((
      <div className='textual-velocity' style={{height: atom.config.get('textual-velocity.panelHeight'), overflow: 'auto'}}>
        {contentComponent}
      </div>
    ), this.domNode)
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
