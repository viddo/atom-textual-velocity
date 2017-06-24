/* @flow */

const privates = new WeakMap();

export default class ToggleAtomWindow {
  constructor(panel: Atom$Panel) {
    privates.set(
      this,
      atom.commands.add(
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
      )
    );
  }

  dispose() {
    const disposable = privates.get(this) || {};

    disposable.dispose();

    privates.delete(this);
  }
}
