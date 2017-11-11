/* @flow */

export default class ToggleAtomWindow {
  _disposable: IDisposable;

  constructor(panel: Atom$Panel) {
    this._disposable = atom.commands.add(
      "atom-workspace",
      "textual-velocity:toggle-atom-window",
      () => {
        if (atom.getCurrentWindow().isFocused()) {
          if (panel.isVisible()) {
            atom.hide(); // hides Atom window
          } else {
            panel.show();
          }
        } else {
          atom.show();
          atom.focus();
          panel.show();
        }
      }
    );
  }

  dispose() {
    this._disposable.dispose();
  }
}
