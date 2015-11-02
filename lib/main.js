'use babel'

import Panel from './panel'
import Repositories from './repositories'
import Service from './service'
import NewUserRepositoryPackage from '../new-user-repository/main'

export default {
  config: {
    bodyHeight: {
      type: 'number',
      default: 200,
      minimum: 0
    }
  },

  activate (state) {
    this.repositories = new Repositories()
    this.service = new Service(this.repositories)

    // fakes consuming the repositorieservice
    NewUserRepositoryPackage.consumeNotationalServiceV0(this.service)

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

    this.panel = new Panel(this.repositories)
    this.hideTreeView()

    this.toggleCmd = atom.commands.add('atom-workspace', 'notational:toggle', () => {
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
  },

  provideServiceV0 () {
    return this.service
  },

  deactivate () {
    if (this.startSessionCmd) {
      this.startSessionCmd.dispose()
      this.startSessionCmd = null
    } else {
      this.stopSession()
    }
    this.service.dispose()
    this.service = null
    this.repositories.dispose()
    this.repositories = null
  }

}
