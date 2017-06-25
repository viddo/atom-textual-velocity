/* @flow */

const privates = new WeakMap();

export default class TogglePanel {
  constructor(panel: Atom$Panel) {
    privates.set(
      this,
      atom.commands.add(
        "atom-workspace",
        "textual-velocity:toggle-panel",
        () => {
          if (panel.isVisible()) {
            panel.hide();
          } else {
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
