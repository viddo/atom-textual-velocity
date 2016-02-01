'use babel'

import R from 'ramda'
import Bacon from 'baconjs'
import React from 'react-for-atom'
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
    const focusBus = new Bacon.Bus()
    focusBus.plug(Bacon.mergeAll(
      focusOnSearchStream,
      togglePanelStream,

      // Focus on search when panel changes visibility (to visible)
      atoms.createStream(this._atomPanel, 'onDidChangeVisible').filter(R.identity),

      // Focus on search when active editor gets focus (e.g. on click or other model cancels)
      atoms.createStream(atom.workspace, 'onDidChangeActivePaneItem').filter(item => item === this._previewEditor),
    ))

    const reactPanel = React.render(
      <PanelComponent focusStream={focusBus}
        bodyHeightStream={atoms.createConfigStream('notational.bodyHeight')}
        filesProp={project.filesProp}
        resultsProp={project.resultsProp}
        openProjectPathStream={project.openProjectPathStream}
        parsedprojectPathStream={project.parsedprojectPathStream}
      />, this._panelElement)

    project.queryBus.plug(
      reactPanel.searchProp.toEventStream() // using this instead of .changes() to trigger an initial query
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
      reactPanel.selectedFileProp
        .debounce(50)
        .onValue(selectedFile => {
          if (selectedFile) {
            if (!this._previewEditor) {
              this._previewEditor = atom.workspace.buildTextEditor()
              this._previewEditor.getTitle = () => 'Notational Preview'
              this._previewEditor.onDidDestroy(() => this._previewEditor = null)
              this._previewEditor.buffer.isModified = R.always(false)
              const view = atom.views.getView(this._previewEditor)
              view.onfocus = function () { focusBus.push(null) }
            }
            atom.workspace.getActivePane().activateItem(this._previewEditor)
            this._previewEditor.setText(selectedFile.content)

            // For preview to behave like a real editor, for interop with other packages (e.g. quick-file-actions)
            this._previewEditor.getPath = R.always(selectedFile.path)
          } else if (this._previewEditor) {
            this._previewEditor.destroy()
          }
        }),

      // Open-file stream trigger; open selected item if any, or create a new file
      Bacon.when(
        [openFileStream, reactPanel.selectedFileProp, reactPanel.searchProp], (_, selectedFile, searchStr) => {
          if (selectedFile) {
            atom.workspace.open(selectedFile.path)
          } else {
            atom.workspace.open(`${searchStr.trim()}.txt`)
          }
        }
      ).onValue(() => {})
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
