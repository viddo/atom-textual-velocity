'use babel'

import Bacon from 'baconjs'
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

export function updatePreview (selectedPathStream, atomWorkspace) {
  return selectedPathStream
    .debounce(50) // to avoid sluggishness on rapid changes
    .diff(undefined, (prevPath, currentPath) => [prevPath, currentPath])
    .onValue(([prevPath, currentPath]) => {
      if (currentPath) {
        atom.workspace.open(currentPath, {
          pending: true,
          activatePane: false
        })
      } else if (prevPath) {
        const pane = atomWorkspace.paneForURI(prevPath)
        if (pane) {
          pane.destroy()
        }
      }
    })
}

export function openEditor (selectedPathStream, newFilePathProp, openStream, atomWorkspace) {
  return Bacon
    .combineTemplate({
      selectedPath: selectedPathStream,
      newFilePath: newFilePathProp
    })
    .sampledBy(openStream)
    .onValue(({selectedPath, newFilePath}) => {
      atomWorkspace.open(selectedPath ? selectedPath : newFilePath)
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
