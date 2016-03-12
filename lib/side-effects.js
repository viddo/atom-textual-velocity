'use babel'
import R from 'ramda'

export function showPanel (focusCmdStream, atomPanel) {
  return focusCmdStream.onValue(() => {
    atomPanel.show()
  })
}

export function togglePanel (togglePanelCmdStream, atomPanel) {
  return togglePanelCmdStream
    .onValue(() => {
      if (atomPanel.isVisible()) {
        atomPanel.hide()
      } else {
        atomPanel.show()
      }
    })
}

export function toggleAtomWindowAndPanel (toggleAtomWinCmdStream, atomPanel, atom) {
  return toggleAtomWinCmdStream
    .onValue(() => {
      if (atom.getCurrentWindow().isFocused()) {
        if (atomPanel.isVisible()) {
          atom.hide() // hide window
        } else {
          atomPanel.show()
        }
      } else {
        atom.show()
        atom.focus()
        atomPanel.show()
      }
    })
}

export function updatePreview (selectedFileProp, atomWorkspace) {
  const URI_PREFIX = 'textual-velocity-preview://'

  let cachedEditor
  atomWorkspace.addOpener(uri => {
    if (uri.startsWith(URI_PREFIX)) {
      const path = uri.replace(URI_PREFIX, '')
      if (!cachedEditor) {
        cachedEditor = atomWorkspace.buildTextEditor()
        const buf = cachedEditor.buffer
        buf.setPath(path)
        // buf.setText(content)
        // buf.cachedDiskContents = content
        buf.clearUndoStack()
      }
      return cachedEditor
    }
  })

  return selectedFileProp
    .debounce(50) // to avoid sluggishness on rapid changes
    .diff(undefined, (prev, selectedFile) => [prev, selectedFile])
    .onValue(([prev, selectedFile]) => {
      if (selectedFile) {
        // TODO Once pending flag on atom.workspace.open is removed we can skip this
        const activeTextEditor = atom.workspace.getActiveTextEditor()
        if (activeTextEditor) {
          const buf = activeTextEditor.buffer
          // Only update if the path have changed, to avoid jumping to EOF on a save
          if (buf.getPath() !== selectedFile.path) {
            buf.setPath(selectedFile.path)
            buf.setText(selectedFile.content)
            buf.cachedDiskContents = selectedFile.content
            buf.clearUndoStack()
          }
        } else {
          atom.workspace.open(selectedFile.path, {
            activatePane: false,
            searchAllPanes: true
          })
        }
      } else if (prev) {
        const pane = atomWorkspace.paneForURI(prev.path)
        if (pane) {
          pane.destroy()
        }
      }
    })
}

export function openEditor (filePathStream, openStream, atomWorkspace) {
  return filePathStream
    .sampledBy(openStream)
    .onValue(path => {
      atomWorkspace.open(path)
    })
}

export function persistSortField (sortFieldProp, atomConfig) {
  return sortFieldProp
    .onValue(sortField => {
      atomConfig.set('textual-velocity.sortField', sortField)
    })
}

export function persistSortDirection (sortDirectionProp, atomConfig) {
  return sortDirectionProp
    .onValue(sortDirection => {
      atomConfig.set('textual-velocity.sortDirection', sortDirection)
    })
}

export function persistPanelHeight (panelHeightProp, atomConfig) {
  return panelHeightProp
    .debounce(200)
    .onValue(h => {
      atomConfig.set('textual-velocity.panelHeight', h)
    })
}
