'use babel'

import {React, ReactDOM} from 'react-for-atom'
import R from 'ramda'
import Bacon from 'baconjs'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import PanelComponent from './react/panel-component'
import newSelectedProps from './new-selected-props'
import newColumns from './new-columns'

// UI adapter for Atom context
// Basically all atom.* usages that contains side-effects related to the UI should go here.
export default class AtomUIAdapter {

  constructor (project) {
    this._domNode = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: this._domNode})

    const keyDownBus = new Bacon.Bus()
    const selectIndexBus = new Bacon.Bus()

    const focusCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:focus-on-search')
    const togglePanelCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-panel')
    const toggleAtomWinCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-atom-window')
    const focusOnSearchStream = Bacon
      .mergeAll(
        focusCmdStream,
        selectIndexBus,
        togglePanelCmdStream,
        toggleAtomWinCmdStream,
        project.isLoadingFilesProp.changes(),
        atoms.createStream(this._atomPanel, 'onDidChangeVisible').filter(isVisible => isVisible)
      )
      .debounce(25)

    const {selectedIndexStream, selectedFileProp} = newSelectedProps({
      filesProp: project.filesProp,
      resultsProp: project.resultsProp,
      deselectStream: project.searchBus,
      keyDownBus: keyDownBus,
      selectIndexBus: selectIndexBus,
      activePathStream: atoms
        .createStream(atom.workspace, 'observeActivePaneItem')
        .filter('.buffer')
        .map('.getPath')
    })

    const reactPanel = ReactDOM.render(
      <PanelComponent
        filesProp={project.filesProp}
        resultsProp={project.resultsProp}
        isLoadingFilesProp={project.isLoadingFilesProp}
        selectedIndexStream={selectedIndexStream}
        focusOnSearchStream={focusOnSearchStream}
        keyDownBus={keyDownBus}
        selectIndexBus={selectIndexBus}
        panelHeightStream={atoms.createConfigStream('textual-velocity.panelHeight')}
        columns={newColumns(project.darwin)}
      />, this._domNode)

    // Make sure search changes are wired back to project's search bus
    // TODO can remove?
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
        .debounce(500)
        .onValue(h => {
          atom.config.set('textual-velocity.panelHeight', h)
        }))

    // Preview or close file when selection changes
    this._disposables.add(
      selectedFileProp
        .filter(R.identity)
        // Open a file is not instant, so debounce to avoid sluggishness on rapid changes (e.g. pressing down/up)
        .debounce(50)
        // TODO extract and test separately? "this._"-usage is a little problematic
        .onValue(selectedFile => {
          const ed = atom.workspace.getActiveTextEditor()
          if (ed) {
            const buff = ed.buffer
            // Only update if the path have changed (e.g. to avoid jumping to EOF on a save)
            if (buff.getPath() !== selectedFile.path) {
              buff.setPath(selectedFile.path)
              buff.setText(selectedFile.content)
              buff.cachedDiskContents = selectedFile.content
              buff.clearUndoStack()
            }
          } else {
            atom.workspace.open(selectedFile.path, {
              activatePane: false,
              searchAllPanes: true
            })
          }
        }))

    // Open selected file path when item is selected
    const enterKeyStream = keyDownBus
      .filter(R.propEq('keyCode', 13))
    this._disposables.add(
      Bacon
        .combineWith(selectedFileProp, project.newFilePathProp, (selectedFile, newFilePath) => {
          return selectedFile
            ? selectedFile.path
            : newFilePath
        })
        .sampledBy(enterKeyStream)
        .onValue(path => {
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
        }))
  }

  dispose () {
    this._atomPanel.destroy()
    this._atomPanel = null

    ReactDOM.unmountComponentAtNode(this._domNode)
    this._domNode = null

    this._disposables.dispose()
    this._disposables = null
  }
}
