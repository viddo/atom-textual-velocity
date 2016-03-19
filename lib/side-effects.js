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
  return selectedFileProp
    .debounce(50) // to avoid sluggishness on rapid changes
    .diff(undefined, (prevFile, selectedFile) => [prevFile, selectedFile])
    .onValue(([prevFile, selectedFile]) => {
      if (selectedFile) {
        atom.workspace.open(selectedFile.path, {
          pending: true,
          activatePane: false,
          searchAllPanes: true
        })
      } else if (prevFile) {
        const pane = atomWorkspace.paneForURI(prevFile.path)
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
