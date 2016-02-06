'use babel'

import R from 'ramda'
import Bacon from 'baconjs'
import {React, ReactDOM} from 'react-for-atom'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import AppBehavior from './app-behavior'
import PanelComponent from './react/panel-component'

// This object should map the Project's streams and AppBehavior into meaningful side-effects in the Atom editor
// Basically all atom.* usages should go here, and only here!
// E.g create atom panel, open buff on selection etc.
export default class SideEffects {

  constructor (project) {
    this._panelElement = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: this._panelElement})

    const closePreviewEditorStream = atoms
      .createStream(atom.workspace, 'onDidDestroyPaneItem')
      .filter(({item}) => item === this._previewEditor)

    const appBehavior = new AppBehavior({
      filesProp: project.filesProp,
      resultsProp: project.resultsProp,
      deselectStream: Bacon.mergeAll(
        closePreviewEditorStream,
        project.searchBus,
      )
    })

    const focusCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:focus-on-search')
    const togglePanelCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-panel')
    const toggleAtomWinCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-atom-window')
    const focusOnSearchStream = Bacon
      .mergeAll(
        focusCmdStream,
        togglePanelCmdStream,
        toggleAtomWinCmdStream,
        appBehavior.selectIndexBus.filter(R.identity),
        // Focus on search when panel changes visibility (to visible)
        atoms.createStream(this._atomPanel, 'onDidChangeVisible').filter(R.identity),
        // Focus on search when active editor gets focus (e.g. on click or other model cancels)
        atoms.createStream(atom.workspace, 'onDidChangeActivePaneItem').filter(item => item === this._previewEditor)
      ).debounce(50)

    const isLoadingFilesProp = Bacon
      .update(
        0,
        [project.openProjectPathStream], count => count + 1,
        [project.parsedprojectPathStream], count => count - 1
      ).map(R.lt(0))

    const reactPanel = ReactDOM.render(
      <PanelComponent focusOnSearchStream={focusOnSearchStream.merge(isLoadingFilesProp.changes())}
        panelHeightStream={atoms.createConfigStream('textualVelocity.panelHeight')}
        filesProp={project.filesProp}
        resultsProp={project.resultsProp}
        isLoadingFilesProp={isLoadingFilesProp}
        selectIndexBus={appBehavior.selectIndexBus}
        selectedIndexStream={appBehavior.selectedIndexStream}
        keyDownBus={appBehavior.keyDownBus}
      />, this._panelElement)

    // Make sure search changes are wired back to project's search bus
    // Using event stream instead of changes, to get an initial event
    project.searchBus.plug(reactPanel.searchProp.toEventStream())

    // Focus on panel when command is triggered
    this._disposables = new DisposableValues()
    this._disposables.add(
      focusCmdStream.onValue(() => {
        this._atomPanel.show()
      }))

    // Toggle panel when command is triggered
    this._disposables.add(
      togglePanelCmdStream
        .onValue(() => {
          if (this._atomPanel.isVisible()) {
            this._atomPanel.hide()
          } else {
            this._atomPanel.show()
          }
        }))

    // Persist the panel height when changed
    this._disposables.add(
      reactPanel.panelHeightProp
        .debounce(500) //
        .onValue(h => {
          atom.config.set('textualVelocity.panelHeight', h)
        }))

    // Preview or close file when selection changes
    this._disposables.add(
      appBehavior.selectedFileProp
        // Open a file is not instant, so debounce to avoid sluggishness on rapid changes (e.g. pressing down/up)
        .debounce(50)
        .onValue(selectedFile => {
          if (selectedFile) {
            if (this._previewEditor) {
              const buff = this._previewEditor.buffer
              // Only update if the path have changed (e.g. to avoid jumping to EOF on a save)
              if (buff.getPath() !== selectedFile.path) {
                buff.setPath(selectedFile.path)
                buff.setText(selectedFile.content)
                buff.clearUndoStack()
              }
            } else {
              atom.workspace.open(selectedFile.path, {
                activatePane: false,
                searchAllPanes: true
              }).then(editor => {
                this._previewEditor = editor
              })
            }
          } else {
            // No selection
            if (this._previewEditor) {
              this._previewEditor.destroy()
              this._previewEditor = null
            }
          }
        }))

    // Remove any reference to a current preview editor when it's closed
    this._disposables.add(
      closePreviewEditorStream.onValue(() => {
        this._previewEditor = null
      }))

    // Open-file stream trigger; open selected item if any, or create a new file
    this._disposables.add(
      Bacon.combineTemplate({
        selectedFile: appBehavior.selectedFileProp,
        searchStr: reactPanel.searchProp
      })
      .sampledBy(appBehavior.enterKeyStream)
      .onValue(({selectedFile, searchStr}) => {
        const path = selectedFile
          ? selectedFile.path
          : `${searchStr.trim()}.md`
        atom.workspace.open(path)
      }))

    // Toggle the Atom application window when command is triggered
    this._disposables.add(
      toggleAtomWinCmdStream
        .onValue(() => {
          if (atom.getCurrentWindow().isFocused()) {
            if (this._atomPanel.isVisible()) {
              atom.hide() // hide window
            } else {
              this._atomPanel.show()
            }
          } else {
            atom.show()
            atom.focus()
            this._atomPanel.show()
          }
        })
    )
  }

  dispose () {
    ReactDOM.unmountComponentAtNode(this._panelElement)
    this._panelElement = null
    this._atomPanel.destroy()
    this._atomPanel = null

    this._disposables.dispose()
    this._disposables = null
  }
}
