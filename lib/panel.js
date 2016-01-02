'use babel'

import R from 'ramda'
import React from 'react-for-atom'
import atoms from './atom-streams'
import DisposableValues from './disposable-values'
import PanelComponent from './react/panel'

// Wrap the panel component, bridges between Atom context and the React panel component
class Panel {

  constructor (itemsProp, queryBus) {
    this._panelElement = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: this._panelElement})

    const isVisibleStream = atoms.createStream(this._atomPanel, 'onDidChangeVisible').filter(R.identity)
    const dblCancelStream = this._dblTapStream(atoms.createCancelCommandStream())

    const reactPanel = React.render(
      <PanelComponent showStream={dblCancelStream.merge(isVisibleStream)}
        bodyHeightStream={atoms.createConfigStream('notational.bodyHeight')}
        itemsProp={itemsProp}
      />, this._panelElement)

    queryBus.plug(reactPanel.searchProp)
    const dblResetStream = this._dblTapStream(reactPanel.resetStream)

    this.disposables = new DisposableValues()
    this.disposables.add(
      dblCancelStream.onValue(() => this._atomPanel.show()),

      reactPanel.bodyHeightProp.debounce(500).onValue(h => atom.config.set('notational.bodyHeight', h)),

      reactPanel.guaranteedSelectedItemProp.onValue(selectedItem => {
        // TODO: for now only preview files if the preview tabs are enabled
        if (atom.config.get('tabs.usePreviewTabs')) {
          // don't activate pane to keep focus on the search input/top panel
          atom.workspace.open(selectedItem.path, {activatePane: false})
        }
      }),

      reactPanel.guaranteedSelectedItemProp.sampledBy(reactPanel.openStream).onValue(selectedItem => {
        atom.workspace.open(selectedItem.path)
      }),

      dblResetStream.onValue(() => {
        this._atomPanel.hide()
        const activePane = atom.workspace.getActivePane()
        if (activePane) {
          activePane.activate()
        }
      })
    )
  }

  isVisible () {
    return this._atomPanel.isVisible()
  }

  show () {
    this._atomPanel.show()
    this._atomPanel.emitter.emit('did-change-visible', true) // force event, to trigger showStream above
  }

  dispose () {
    React.unmountComponentAtNode(this._panelElement)
    this._panelElement = null
    this._atomPanel.destroy()
    this._atomPanel = null

    this.disposables.dispose()
    this.disposables = null
  }

  // filter a given stream to only trigger if tow event are triggered within 300ms (e.g. dbl-ESC)
  _dblTapStream (stream) {
    return stream.bufferWithTimeOrCount(300, 2).filter(R.propEq('length', 2))
  }
}

export default Panel
