'use babel'

import R from 'ramda'
import Path from 'path'
import React from 'react-for-atom'
import Bacon from 'baconjs'
import atoms from './atom-streams'
import DisposableValues from './disposable-values'
import columns from './columns'
import PanelComponent from './notational/panel'

// Wrap the panel component, bridges between Atom context and the React panel component
class NotationalPanel {

  constructor (projects) {
    this._panelElement = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: this._panelElement})

    let isVisibleStream = atoms.stream(this._atomPanel, 'onDidChangeVisible').filter(R.identity)
    let dblCancelStream = this._dblTapStream(atoms.cancelCommand())

    let reactPanel = React.render(
      <PanelComponent columnsProp={Bacon.sequentially(0, [columns]).toProperty([])}
        showStream={dblCancelStream.merge(isVisibleStream)}
        bodyHeightStream={atoms.configStream('notational.bodyHeight')}
        searchBus={projects.searchBus}
        matchedItemsProp={projects.matchedItemsProp}
      />, this._panelElement)

    let dblResetStream = this._dblTapStream(reactPanel.resetStream)

    this.disposables = new DisposableValues()
    this.disposables.add(
      dblCancelStream.onValue(() => this._atomPanel.show()),

      reactPanel.bodyHeightProp.debounce(500).onValue(newHeight =>
        atom.config.set('notational.bodyHeight', newHeight)
      ),

      reactPanel.guaranteedSelectedItemProp.onValue(selectedItem => {
        // TODO: for now only preview files if the preview tabs are enabled
        if (atom.config.get('tabs.usePreviewTabs')) {
          // don't activate pane to keep focus on the search input/top panel
          atom.workspace.open(Path.join(selectedItem.projectPath, selectedItem.relPath), {activatePane: false})
        }
      }),

      reactPanel.guaranteedSelectedItemProp.sampledBy(reactPanel.openStream).onValue(selectedItem => {
        atom.workspace.open(Path.join(selectedItem.projectPath, selectedItem.relPath))
      }),

      dblResetStream.onValue(() => {
        this._atomPanel.hide()
        let activePane = atom.workspace.getActivePane()
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

export default NotationalPanel
