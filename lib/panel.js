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

  constructor (project) {
    this._panelElement = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: this._panelElement})

    const focusOnSearchStream = atoms.createCommandStream('atom-workspace', 'notational:focus-on-search')
    const togglePanelStream = atoms.createCommandStream('atom-workspace', 'notational:toggle-panel')
    const focusStream = Bacon.mergeAll(
      focusOnSearchStream,
      togglePanelStream,

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
        resultsProp={project.resultsProp}
        openProjectPathStream={project.openProjectPathStream}
        parsedprojectPathStream={project.parsedprojectPathStream}
      />, this._panelElement)

    project.queryBus.plug(
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
      focusOnSearchStream.onValue(() => {
        this._atomPanel.show()
      }),

      togglePanelStream.onValue(() => {
        if (this._atomPanel.isVisible()) {
          this._atomPanel.hide()
        } else {
          this._atomPanel.show()
        }
      }),

      reactPanel.bodyHeightProp.debounce(500).onValue(h => atom.config.set('notational.bodyHeight', h)),

      // An item is selected; preview it after debounce (to avoid slugginess)
      reactPanel.selectedItemProp
        .debounce(50)
        .onValue(selectedItem => {
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

      // Open-file stream trigger; open selected item
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
