'use babel'

import R from 'ramda'
import Bacon from 'baconjs'
import React from 'react-for-atom'
import Path from 'path'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import PanelComponent from './react/panel'

// Wrap the panel component, bridges between Atom context and the React panel component
class Panel {

  constructor (resultsProp, queryBus) {
    this._panelElement = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: this._panelElement})

    const focusOnPanelStream = atoms.createCommandStream('atom-workspace', 'notational:focus-on-panel')
    const focusStream = Bacon.mergeAll(
      focusOnPanelStream,

      // When panel changes visibility to visible
      atoms
        .createStream(this._atomPanel, 'onDidChangeVisible')
        .filter(R.identity),

      // When preview is focused
      atoms
        .createStream(atom.workspace, 'onDidChangeActivePaneItem')
        .filter(item => item === this._previewEditor)
    )

    const reactPanel = React.render(
      <PanelComponent focusStream={focusStream}
        bodyHeightStream={atoms.createConfigStream('notational.bodyHeight')}
        resultsProp={resultsProp}
      />, this._panelElement)

    queryBus.plug(
      Bacon.combineTemplate({
        searchStr: reactPanel.searchProp,
        paginationOffset: reactPanel.paginationOffsetProp,
        paginationSize: reactPanel.paginationSizeProp
      })
      .toEventStream() // using this instead of .changes() to trigger an initial query
    )

    // Open either on open-stream event from panel, or if clicking inside the previewEditor
    const openFileStream = Bacon
        .fromEvent(atom.views.getView(atom.workspace), 'click')
        .filter(ev => ev.srcElement === atom.views.getView(this._previewEditor))
        .merge(reactPanel.enterKeyStream)

    this.disposables = new DisposableValues(
      focusOnPanelStream.onValue(() => this._atomPanel.show()),

      reactPanel.bodyHeightProp.debounce(500).onValue(h => atom.config.set('notational.bodyHeight', h)),

      reactPanel.selectedItemProp.onValue(selectedItem => {
        if (selectedItem) {
          if (!this._previewEditor) {
            this._previewEditor = atom.workspace.buildTextEditor()
            this._previewEditor.getTitle = () => 'Notational Preview'
            this._previewEditor.onDidDestroy(() => this._previewEditor = null)
            this._previewEditor.buffer.isModified = R.always(false)
          }
          atom.workspace.getActivePane().activateItem(this._previewEditor)
          this._previewEditor.setText(selectedItem.content)
        } else if (this._previewEditor) {
          this._previewEditor.destroy()
        }
      }),

      reactPanel.selectedItemProp
        .filter(R.is(Object))
        .sampledBy(openFileStream)
        .onValue(selectedItem => {
          atom.workspace.open(Path.join(selectedItem.projectPath, selectedItem.relPath))
        })
    )
  }

  isVisible () {
    return this._atomPanel.isVisible()
  }

  show () {
    this._atomPanel.show()
    this._atomPanel.emitter.emit('did-change-visible', true) // force event, to trigger focusStream
  }

  dispose () {
    React.unmountComponentAtNode(this._panelElement)
    this._panelElement = null
    this._atomPanel.destroy()
    this._atomPanel = null

    this.disposables.dispose()
    this.disposables = null
  }
}

export default Panel
