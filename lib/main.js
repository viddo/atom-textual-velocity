'use babel'

import Bacon from 'baconjs'
import NotationalPanel from './notational-panel'
import Projects from './projects'

export default {
  config: {
    bodyHeight: {
      type: 'number',
      default: 200,
      minimum: 0
    }
  },

  activate (state) {
    this.startSession()
  },

  startSession () {
    this.disposeAndRemove('startSessionCmd')
    this.projects = new Projects()

    this.panel = new NotationalPanel(this.projects)
    this.stopSessionCmd = atom.commands.add('atom-workspace', 'atom-notational:stop-session', () => {
      this.stopSession()
      this.addStartSessionCmd()
    })

    this.toggleCmd = atom.commands.add('atom-workspace', 'atom-notational:toggle', () => {
      this.toggleAtomWindow()
    })
  },

  addStartSessionCmd () {
    this.startSessionCmd = atom.commands.add('atom-workspace', 'atom-notational:start-session', () => {
      this.startSession()
    })
  },

  stopSession () {
    if (this.activateBus) this.activateBus.push(Bacon.noMore)
    this.activateBus = null
    for (var prop of ['stopSessionCmd', 'startSessionCmd', 'panel', 'projects']) {
      this.disposeAndRemove(prop)
    }
  },

  toggleAtomWindow () {
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
      }
    }
  },

  deactivate () {
    this.stopSession()
    this.disposeAndRemove('startSessionCmd')
  },

  disposeAndRemove (propName) {
    let prop = this[propName]
    if (prop) prop.dispose()
    this[propName] = null
  }

}
