/* @flow */

export default class TogglePanel {
  _disposable: atom$IDisposable;

  constructor(panel: atom$Panel) {
    this._disposable = atom.commands.add(
      "atom-workspace",
      "textual-velocity:toggle-panel",
      () => {
        if (panel.isVisible()) {
          panel.hide();
        } else {
          panel.show();
        }
      }
    );
  }

  dispose() {
    this._disposable.dispose();
  }
}
