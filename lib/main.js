'use babel'

import Panel from './panel'
import Project from './project'

export default {
  config: {
    bodyHeight: {
      type: 'number',
      default: 200,
      minimum: 0
    },
    customPathsCfg: {
      title: 'Custom configurations for paths',
      description: 'Allow you to override the default preferences for specific paths',
      type: 'array',
      default: [],
      items: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            default: '/absolute/path/to/dir',
            description: 'Path to dir to set custom settings'
          },
          // From https://github.com/atom/scandal/blob/6e4519b2c01a74efbcedf1cfb2dd9bd7409f0627/src/path-filter.coffee#L20-L23
          inclusions: {
            type: 'array',
            description: 'Patterns to include. Uses minimatch with a couple additions: "dirname" and "dirname/" will match all paths in directory dirname.',
            default: ['.txt', '.md'],
            items: {
              type: 'string'
            }
          },
          exclusions: {
            type: 'array',
            description: 'Patterns to exclude. Same matcher as inclusions.',
            default: ['.git', '.hg', '.svn', '.DS_Store', '._*', 'Thumbs.db'],
            items: {
              type: 'string'
            }
          },
          // From https://github.com/atom/atom/blob/ec66a66bb3c4be92b01f861e210f429e4737da7b/src/config-schema.coffee#L16
          excludeVcsIgnoredPaths: {
            type: 'boolean',
            default: true,
            title: 'Exclude VCS Ignored Paths',
            description: 'Files and directories ignored by the current project\'s VCS system will be ignored by some packages, such as the fuzzy finder and find and replace. For example, projects using Git have these paths defined in the .gitignore file. Individual packages might have additional config settings for ignoring VCS ignored files and folders.'
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
    this.stopSessionCmd = atom.commands.add('atom-workspace', 'notational:stop-session', () => {
      this.stopSession()
      this.startSessionCmd = atom.commands.add('atom-workspace', 'notational:start-session', () => {
        this.startSession()
      })
    })

    this.project = new Project()
    this.panel = new Panel(this.project)
    this.hideTreeView()

    this.toggleCmd = atom.commands.add('atom-workspace', 'notational:toggle-atom-window', () => {
      if (this.panel) {
        if (atom.getCurrentWindow().isFocused()) {
          if (this.panel.isVisible()) {
            atom.hide() // hide window
          } else {
            this.panel.show()
          }
        } else {
          atom.show()
          atom.focus()
          this.panel.show()
          this.hideTreeView()
        }
      }
    })
  },

  hideTreeView () {
    try {
      const treeView = atom.packages.getActivePackage('tree-view').mainModule.createView()
      if (treeView.isVisible()) treeView.toggle()
    } catch (e) {
    }
  },

  stopSession () {
    this.stopSessionCmd.dispose()
    this.stopSessionCmd = null
    this.toggleCmd.dispose()
    this.toggleCmd = null
    this.panel.dispose()
    this.panel = null
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
