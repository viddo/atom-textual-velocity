'use babel'

import R from 'ramda'
import Bacon from 'baconjs'
import {React, ReactDOM} from 'react-for-atom'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import Behavior from './behavior'
import PanelComponent from './react/panel'

// Wrap the panel component, bridges between Atom context and the rest, i.e. Behavior and React panel
// This model should have all side-effects that's related to atom
export default class Panel {

  constructor (project) {
    this._panelElement = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: this._panelElement})

    const closePreviewEditorStream = atoms
      .createStream(atom.workspace, 'onDidDestroyPaneItem')
      .filter(({item}) => item === this._previewEditor)

    const behavior = new Behavior({
      filesProp: project.filesProp,
      resultsProp: project.resultsProp,
      deselectStream: Bacon.mergeAll(
        closePreviewEditorStream,
        project.searchBus,
      )
    })

    const focusCmdStream = atoms.createCommandStream('atom-workspace', 'textualVelocity:focus-on-search')
    const togglePanelStream = atoms.createCommandStream('atom-workspace', 'textualVelocity:toggle-panel')
    const focusOnSearchStream = Bacon
      .mergeAll(
        focusCmdStream,
        togglePanelStream,
        // Focus on search when panel changes visibility (to visible)
        atoms.createStream(this._atomPanel, 'onDidChangeVisible').filter(R.identity),
        // Focus on search when active editor gets focus (e.g. on click or other model cancels)
        atoms.createStream(atom.workspace, 'onDidChangeActivePaneItem').filter(item => item === this._previewEditor)
      )

    const reactPanel = ReactDOM.render(
      <PanelComponent focusOnSearchStream={focusOnSearchStream}
        panelHeightStream={atoms.createConfigStream('textualVelocity.panelHeight')}
        filesProp={project.filesProp}
        resultsProp={project.resultsProp}
        openProjectPathStream={project.openProjectPathStream}
        parsedprojectPathStream={project.parsedprojectPathStream}
        selectIndexBus={behavior.selectIndexBus}
        selectedIndexStream={behavior.selectedIndexStream}
        keyDownBus={behavior.keyDownBus}
      />, this._panelElement)

    // Side-effects
    project.searchBus.plug(reactPanel.searchProp.toEventStream())
    project.searchBus.plug(behavior.escKeyStream.map(''))

    this.disposables = new DisposableValues(
      focusCmdStream.onValue(() => {
        this._atomPanel.show()
      }),

      togglePanelStream
        .onValue(() => {
          if (this._atomPanel.isVisible()) {
            this._atomPanel.hide()
          } else {
            this._atomPanel.show()
          }
        }),

      reactPanel
        .panelHeightProp
        .debounce(500)
        .onValue(h => {
          atom.config.set('textualVelocity.panelHeight', h)
        }),

      // An item is selected; preview it after debounce (to avoid slugginess)
      behavior.selectedFileProp
        .debounce(50)
        .onValue(file => {
          if (!file) {
            if (this._previewEditor) {
              this._previewEditor.destroy()
              this._previewEditor = null
            }
            return
          }

          if (this._previewEditor) {
            const buff = this._previewEditor.buffer
            // Only update if the path have changed (e.g. to avoid jumping to EOF on a save)
            if (buff.getPath() !== file.path) {
              buff.setPath(file.path)
              buff.setText(file.content)
              buff.clearUndoStack()
            }
          } else {
            atom.workspace.open(file.path, {
              activatePane: false,
              searchAllPanes: true
            }).then(editor => {
              this._previewEditor = editor
            })
          }
        }),

      // Remove reference to preview editor when it closes
      closePreviewEditorStream.onValue(() => {
        this._previewEditor = null
      }),

      // Open-file stream trigger; open selected item if any, or create a new file
      Bacon
        .combineTemplate({
          selectedFile: behavior.selectedFileProp,
          searchStr: reactPanel.searchProp
        })
        .sampledBy(behavior.enterKeyStream)
        .onValue(({file, searchStr}) => {
          const path = file
            ? file.path
            : `${searchStr.trim()}.md`
          atom.workspace.open(path)
        })
    )
  }

  isVisible () {
    return this._atomPanel.isVisible()
  }

  show () {
    this._atomPanel.show()
    this._atomPanel.emitter.emit('did-change-visible', true) // force event, to trigger focusOnSearchStream
  }

  dispose () {
    ReactDOM.unmountComponentAtNode(this._panelElement)
    this._panelElement = null
    this._atomPanel.destroy()
    this._atomPanel = null

    this.disposables.dispose()
    this.disposables = null
  }
}
