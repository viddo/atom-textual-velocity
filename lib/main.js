'use babel'

import {Directory} from 'atom'
import Path from 'path'
import Project from './project'
import UIAtomAdapter from './ui-atom-adapter'

const DEFAULT_NOTES_REL_PATH = 'notes'

export default {
  config: {
    panelHeight: {
      type: 'number',
      default: 150,
      minimum: 0
    },
    path: {
      description: 'Path to folder where to find notes. Can be an absolute or relative (to .atom) path. If empty will load project folders instead.',
      type: 'string',
      default: DEFAULT_NOTES_REL_PATH
    }
  },

  rootPath () {
    const path = atom.config.get('textual-velocity.path') || DEFAULT_NOTES_REL_PATH
    return Path.isAbsolute(path)
      ? path
      : Path.join(atom.configDirPath, path)
  },

  activate (state) {
    this.startSession()
  },

  startSession () {
    this.disposeStartSessionCmd()
    this.stopSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:stop-session', this.stopSession.bind(this))

    const dir = new Directory(this.rootPath())
    dir.create() // make sure directory exists
    this.project = new Project(dir.getPath())
    this.uiAtomAdapter = new UIAtomAdapter(this.project)

    let pathChange
    pathChange = atom.config.onDidChange('textual-velocity.path', {}, () => {
      this.stopSession()
      pathChange.dispose()
    })
  },

  disposeStartSessionCmd () {
    if (this.startSessionCmd) {
      this.startSessionCmd.dispose()
      this.startSessionCmd = null
    }
  },

  stopSession () {
    this.disposeSession()
    this.startSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:start-session', () => {
      this.startSession()
    })
  },

  disposeSession () {
    if (this.stopSessionCmd) {
      this.stopSessionCmd.dispose()
      this.stopSessionCmd = null
      this.uiAtomAdapter.dispose()
      this.uiAtomAdapter = null
      this.project.dispose()
      this.project = null
    }
  },

  deactivate () {
    this.disposeStartSessionCmd()
    this.stopSession()
  }

}
