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
    this.startSessionCmd = { dispose: function () {} } // null object
    this.startSession()
  },

  startSession () {
    this.startSessionCmd.dispose()
    this.startSessionCmd = null
    this.stopSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:stop-session', () => {
      this.stopSession()
      this.startSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:start-session', () => {
        this.startSession()
      })
    })

    this.project = new Project()
    this.session = new Session(this.project)
    this.hideTreeView()

    this.toggleCmd = atom.commands.add('atom-workspace', 'textual-velocity:toggle-atom-window', () => {
      if (this.session) {
        if (atom.getCurrentWindow().isFocused()) {
          if (this.session.isVisible()) {
            atom.hide() // hide window
          } else {
            this.session.show()
          }
        } else {
          atom.show()
          atom.focus()
          this.session.show()
          this.hideTreeView()
        }
      }
    })
  },

  hideTreeView () {
    // Add try catch to avoid
    try {
      const treeView = atom.packages.getActivePackage('tree-view').mainModule.createView()
      if (treeView.isVisible()) treeView.toggle()
    } catch (e) {
      console.warn('[textualVelocity] failed to hide tree-view:', e)
    }
  },

  stopSession () {
    this.stopSessionCmd.dispose()
    this.stopSessionCmd = null
    this.toggleCmd.dispose()
    this.toggleCmd = null
    this.session.dispose()
    this.session = null
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
