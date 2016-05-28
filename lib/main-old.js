'use babel'

import Path from 'path'
import {Directory} from 'atom'
import * as atoms from './atom-streams'
import AtomUIAdapter from './atom-ui-adapter'
import Project from './project'

export default {

  rootPath () {
    const path = atom.config.get('textual-velocity.path') || 'notes'
    const absPath = Path.isAbsolute(path)
        ? path
        : Path.join(atom.configDirPath, path)

    const dir = new Directory(absPath)
    dir.create() // make sure directory exists
    return dir.getPath()
  },

  activate (state) {
    this.startSession()
  },

  startSession () {
    this.project = new Project({
      rootPath: this.rootPath(),
      sortFieldProp: atoms.createConfigStream('textual-velocity.sortField'),
      sortDirectionProp: atoms.createConfigStream('textual-velocity.sortDirection')
    })
    this.atomUIAdapter = new AtomUIAdapter(this.project)

    this.stopSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:stop-session', () => {
      this.stopSession()
      this.startSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:start-session', () => {
        this.startSessionCmd.dispose()
        this.startSessionCmd = null
        this.startSession()
      })
    })
  },

  stopSession () {
    this.stopSessionCmd.dispose()
    this.stopSessionCmd = null
    this.atomUIAdapter.dispose()
    this.atomUIAdapter = null
    this.project.dispose()
    this.project = null
  },

  deactivate () {
    if (this.startSessionCmd) {
      this.startSessionCmd.dispose()
      this.startSessionCmd = null
    } else {
      this.stopSession()
    }
  }

}
