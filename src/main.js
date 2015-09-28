'use babel';

import Bacon from 'baconjs';
import atoms from './atom-streams';
import Panels from './panels';
import Projects from './projects';

export default {
  config: {
    bodyHeight: {
      type: 'number',
      default: 200,
      minimum: 0,
    },
  },

  activate(state) {
    this.startSession();
  },

  startSession() {
    this.disposeAndRemove('startSessionCmd');
    this.panels = new Panels(new Projects());
    this.stopSessionCmd = atom.commands.add('atom-workspace', 'atom-notational:stop-session', () => {
      this.stopSession();
      this.addStartSessionCmd();
    });
  },

  addStartSessionCmd() {
    this.startSessionCmd = atom.commands.add('atom-workspace', 'atom-notational:start-session', () => {
      this.startSession();
    });
  },

  stopSession() {
    for (var prop of ['stopSessionCmd', 'startSessionCmd', 'panels']) {
      this.disposeAndRemove(prop);
    }
  },

  deactivate() {
    this.stopSession();
    this.disposeAndRemove('startSessionCmd');
  },

  disposeAndRemove(propName) {
    let prop = this[propName];
    if (prop) prop.dispose();
    this[propName] = null;
  },

};
