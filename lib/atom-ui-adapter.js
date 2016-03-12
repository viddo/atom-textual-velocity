'use babel'

import {React, ReactDOM} from 'react-for-atom'
import R from 'ramda'
import Bacon from 'baconjs'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import PanelComponent from './react/panel-component'
import newSelectedProps from './new-selected-props'
import newColumns from './new-columns'
import * as sideEffects from './side-effects'

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
      activePathStream: atoms.createStream(atom.workspace, 'observeActivePaneItem').map('.buffer.getPath')
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

    this._disposables = new DisposableValues()
    this._disposables.add(
      sideEffects.persistSortField(reactPanel.sortFieldProp, atom.config),
      sideEffects.persistSortDirection(reactPanel.sortDirectionProp, atom.config),
      sideEffects.persistPanelHeight(reactPanel.panelHeightProp, atom.config),
      sideEffects.toggleAtomWindowAndPanel(toggleAtomWinCmdStream, this._atomPanel, atom),
      sideEffects.showPanel(focusCmdStream, this._atomPanel),
      sideEffects.togglePanel(togglePanelCmdStream, this._atomPanel),
      sideEffects.updatePreview(selectedFileProp, atom.workspace),
    )

    const enterKeyStream = keyDownBus.filter(R.propEq('keyCode', 13))
    const filePathStream = Bacon
      .combineWith(selectedFileProp, project.newFilePathProp, (f, newFilePath) => {
        return f ? f.path : newFilePath
      })
    this._disposables.add(
      sideEffects.openEditor(filePathStream, enterKeyStream, atom.workspace)
    )
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
