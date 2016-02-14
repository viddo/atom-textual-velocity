'use babel'

import {React} from 'react-for-atom'
import Bacon from 'baconjs'
import * as atoms from './atom-streams'
import DisposableValues from './disposable-values'
import DateTimeComponent from './react/cells/date-time-component'
import SummaryComponent from './react/cells/summary-component'
import TagsComponent from './react/cells/tags-component'
import UI from './ui'

// Adapter for Atom-land
// Basically all atom.* usages that contains side-effects related to the UI should go here.
export default class UIAtomAdapter {

  constructor (project) {
    const panelDomNode = document.createElement('div')
    this._atomPanel = atom.workspace.addTopPanel({item: panelDomNode})
    this._previewEditor = null

    const closePreviewEditorStream = atoms
      .createStream(atom.workspace, 'onDidDestroyPaneItem')
      .filter(({item}) => item === this._previewEditor)

    const focusCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:focus-on-search')
    const togglePanelCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-panel')
    const toggleAtomWinCmdStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:toggle-atom-window')
    const focusOnSearchStream = Bacon
      .mergeAll(
        focusCmdStream,
        togglePanelCmdStream,
        toggleAtomWinCmdStream,
        // Focus on search when panel changes visibility (to visible)
        atoms.createStream(this._atomPanel, 'onDidChangeVisible').filter(isVisible => isVisible),
        // Focus on search when active editor gets focus (e.g. on click or other model cancels)
        atoms.createStream(atom.workspace, 'onDidChangeActivePaneItem').filter(item => item === this._previewEditor)
      )
      .debounce(50)
      .merge(project.isLoadingFilesProp.changes()) // placed after debounce, to trigger immeditately

    const columns = []
    columns.push({
      title: 'Name',
      width: 50,
      createCell: (file, state) => {
        return <SummaryComponent key='name' file={file}
        searchStr={state.searchStr} tokens={state.results.tokens} />
      }
    })
    if (project.darwin) {
      const editTagsStream = atoms.createCommandStream('atom-workspace', 'textual-velocity:edit-tags')
      columns.push({
        title: 'Tags',
        width: 20,
        createCell: (file, state, isSelected) => {
          const saveTags = tags => project.darwin.setTags(file.path, tags.trim().split(' '))
          return (
            <TagsComponent key='tags' tags={file.tags} isSelected={isSelected} saveTags={saveTags}
              editTagsStream={editTagsStream} />
          )
        }
      })
    }
    columns.push({
      title: 'Date modified',
      width: 15,
      createCell: file => {
        return <DateTimeComponent key='mtime' time={file.stat.mtime} />
      }
    })
    columns.push({
      title: 'Date created',
      width: 15,
      createCell: file => {
        return <DateTimeComponent key='birhtime' time={file.stat.birthtime} />
      }
    })

    const ui = new UI({
      domNode: panelDomNode,
      isLoadingFilesProp: project.isLoadingFilesProp,
      filesProp: project.filesProp,
      resultsProp: project.resultsProp,
      columns: columns,
      panelHeightStream: atoms.createConfigStream('textual-velocity.panelHeight'),
      focusOnSearchStream: focusOnSearchStream,
      deselectStream: Bacon.mergeAll(
        closePreviewEditorStream,
        project.searchBus,
      )})

    // Make sure search changes are wired back to project's search bus
    project.searchBus.plug(ui.searchProp.toEventStream())

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
      ui.panelHeightProp
        .debounce(500)
        .onValue(h => {
          atom.config.set('textual-velocity.panelHeight', h)
        }))

    // Preview or close file when selection changes
    this._disposables.add(
      ui.selectedFileProp
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

    // Open selected file path when item is selected
    this._disposables.add(
      ui.openFileStream
        .onValue(path => {
          atom.workspace.open(path)
        }))

    this._disposables.add(
      project
        .newFilePathProp
        .sampledBy(ui.createFileStream)
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
        })
    )
  }

  dispose () {
    this._atomPanel.destroy()
    this._atomPanel = null

    this._disposables.dispose()
    this._disposables = null
  }
}
