'use babel'

import Session from './session'
import Project from './project'

export default {
  config: {
    panelHeight: {
      type: 'number',
      default: 150,
      minimum: 0
    },
    customCfg: {
      title: 'Custom settings',
      description: 'Override of default settings for specific paths',
      type: 'array',
      default: [],
      items: {
        type: 'object',
        properties: {
          path: {
            description: 'Path to folder, to apply settings for',
            type: 'string',
            default: '/some/path'
          },
          inclusions: {
            description: 'Patterns to include. Uses [minimatch](https://github.com/isaacs/minimatch) with a couple additions: "dirname" and "dirname/" will match all paths in directory dirname.',
            type: 'array',
            default: ['*.txt', '*.md'],
            items: {
              type: 'string'
            }
          }
        }
      }
    }
  },

  activate (state) {
    this.startSession()
  },

  startSession () {
    this.disposeStartSessionCmd()
    this.stopSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:stop-session', () => {
      this.stopSession()
      this.startSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:start-session', () => {
        this.startSession()
      })
    })

    this.project = new Project()
    this.session = new Session(this.project)
  },

  disposeStartSessionCmd () {
    if (this.startSessionCmd) {
      this.startSessionCmd.dispose()
      this.startSessionCmd = null
    }
  },

  stopSession () {
    if (this.stopSessionCmd) {
      this.stopSessionCmd.dispose()
      this.stopSessionCmd = null
      this.session.dispose()
      this.session = null
      this.project.dispose()
      this.project = null
    }
  },

  deactivate () {
    this.disposeStartSessionCmd()
    this.stopSession()
  }

}
