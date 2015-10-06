'use babel';

import {Disposable, CompositeDisposable} from 'atom';
import NotationalPanel from './notational-panel';

// Manages the state of the panels
class Panels {

  constructor(projects) {
    this.disposables = new CompositeDisposable();
    this.panel = new NotationalPanel(projects);
    this.disposables.add(this.panel);
  }

  dispose() {
    this.disposables.dispose();
    this.disposables = null;
    this.panel = null;
  }
};

export default Panels;
